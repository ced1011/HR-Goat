# RCE Exploit Examples

This directory contains example JSON files that demonstrate the Remote Code Execution (RCE) vulnerability via insecure deserialization in the HRGoat application.

## Files

- `rce_exploit.json`: Contains a Bash reverse shell payload for Linux/macOS systems
- `rce_exploit_windows.json`: Contains a PowerShell reverse shell payload for Windows systems

## How to Use

1. **Set up a listener on your machine**:
   ```bash
   nc -lvnp 4444
   ```

2. **Edit the exploit file**:
   - Open either `rce_exploit.json` or `rce_exploit_windows.json` depending on the target system
   - Replace `ATTACKER_IP` with your actual IP address

3. **Upload the exploit**:
   - Log in to the HRGoat application
   - Navigate to System Tools
   - Select the "Bulk Employee Upload" tab
   - Upload the modified JSON file

4. **Check your listener**:
   - If successful, you should receive a shell connection from the target server

## Security Warning

These examples are provided for educational purposes only. The exploits demonstrate a serious security vulnerability that should never be present in production applications. Use these examples only in controlled environments where the vulnerability has been intentionally implemented for learning purposes.

## Mitigation

In real-world applications, you should:

1. Never deserialize untrusted data
2. Use safer alternatives like JSON.parse() instead of serialization libraries that support code execution
3. Validate and sanitize all user inputs
4. Implement integrity checks for serialized data
5. Run applications with the minimum necessary permissions 