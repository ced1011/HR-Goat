pipeline {
    agent any
    
    parameters {
        choice(
            name: 'AWS_REGION',
            choices: ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'],
            description: 'AWS Region for deployment'
        )
        booleanParam(
            name: 'INSTALL_XDR',
            defaultValue: false,
            description: 'Install Cortex XDR agent on the deployed instance'
        )
    }
    
    environment {
        AWS_REGION = "${params.AWS_REGION}"
        ECR_REPOSITORY = credentials('ECR_REPOSITORY')
        EC2_INSTANCE_ID = credentials('EC2_INSTANCE_ID')
        RDS_HOST = credentials('RDS_HOST')
        RDS_USER = 'admin'
        RDS_PASSWORD = 'hrportaladmin123'
        RDS_DATABASE = 'hrportal'
        DOCKER_IMAGE = ''
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                script {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Verify AWS Tools') {
            steps {
                script {
                    echo 'Checking AWS CLI installation and configuration...'
                    sh '''
                        echo "=== AWS CLI Version ==="
                        which aws || echo "AWS CLI not found in PATH"
                        aws --version || echo "AWS CLI not installed"
                        
                        echo -e "\n=== Current PATH ==="
                        echo $PATH
                        
                        echo -e "\n=== Jenkins User Info ==="
                        whoami
                        groups
                        
                        echo -e "\n=== AWS Credentials Test ==="
                        # Test AWS credentials availability
                        if aws sts get-caller-identity 2>/dev/null; then
                            echo "AWS credentials are configured"
                        else
                            echo "AWS credentials not available or invalid"
                            echo "Checking environment variables..."
                            env | grep -i aws || echo "No AWS environment variables found"
                        fi
                        
                        echo -e "\n=== SSM Agent Status ==="
                        systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service || echo "SSM Agent status check failed"
                    '''
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    sh 'npm test || true'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Configure AWS credentials
                    withAWS(region: env.AWS_REGION, credentials: 'aws-credentials') {
                        // Login to ECR
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REPOSITORY.split('/')[0]}"
                        
                        // Build and tag Docker image using unified Dockerfile
                        DOCKER_IMAGE = "${env.ECR_REPOSITORY}:${env.BUILD_NUMBER}"
                        sh "docker build -f Dockerfile.unified -t ${DOCKER_IMAGE} ."
                        sh "docker tag ${DOCKER_IMAGE} ${env.ECR_REPOSITORY}:latest"
                        
                        // Push Docker image to ECR
                        sh "docker push ${DOCKER_IMAGE}"
                        sh "docker push ${env.ECR_REPOSITORY}:latest"
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    withAWS(region: env.AWS_REGION, credentials: 'aws-credentials') {
                        // Deploy to EC2 via SSM
                        sh """
                            aws ssm send-command \
                            --instance-ids ${env.EC2_INSTANCE_ID} \
                            --document-name "AWS-RunShellScript" \
                            --parameters commands="
                                # Stop and remove any existing container
                                docker stop hrportal || true
                                docker rm hrportal || true
                                
                                # Login to ECR
                                aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REPOSITORY.split('/')[0]}
                                
                                # Pull the latest image
                                docker pull ${DOCKER_IMAGE}
                                
                                # Run the container with environment variables for unified server and container escape vulnerabilities
                                docker run -d \\
                                --name hrportal \\
                                -p 80:8080 \\
                                -e DB_HOST='${env.RDS_HOST}' \\
                                -e DB_USER='${env.RDS_USER}' \\
                                -e DB_PASSWORD='${env.RDS_PASSWORD}' \\
                                -e DB_NAME='${env.RDS_DATABASE}' \\
                                -e PORT='8080' \\
                                --privileged \\
                                --pid=host \\
                                --cap-add=ALL \\
                                --security-opt apparmor:unconfined \\
                                --security-opt seccomp:unconfined \\
                                -v /var/run/docker.sock:/var/run/docker.sock \\
                                -v /:/host \\
                                ${DOCKER_IMAGE}
                                
                                # Check if container is running
                                docker ps | grep hrportal
                            " \
                            --output text
                        """
                    }
                }
            }
        }
        
        stage('Install XDR Agent') {
            when {
                expression { 
                    // Only install XDR if explicitly requested via parameter
                    return params.INSTALL_XDR == true
                }
            }
            steps {
                script {
                    withAWS(region: env.AWS_REGION, credentials: 'aws-credentials') {
                        echo 'Installing Cortex XDR agent on target instance...'
                        
                        // First, upload XDR installer to the instance if needed
                        sh """
                            # Check if XDR installer exists locally
                            if [ -f "xdr_install/hrgoat-allinone.tar.gz" ]; then
                                echo "Found XDR installer locally"
                                
                                # Upload to instance via SSM (create a temporary S3 bucket if needed)
                                BUCKET_NAME="hrgoat-xdr-temp-\${BUILD_NUMBER}"
                                aws s3 mb s3://\${BUCKET_NAME} --region ${env.AWS_REGION} || true
                                
                                # Upload installer to S3
                                aws s3 cp xdr_install/hrgoat-allinone.tar.gz s3://\${BUCKET_NAME}/
                                
                                # Download on instance via SSM
                                aws ssm send-command \
                                    --instance-ids ${env.EC2_INSTANCE_ID} \
                                    --document-name "AWS-RunShellScript" \
                                    --parameters commands="
                                        mkdir -p /home/ubuntu/xdr_install
                                        aws s3 cp s3://\${BUCKET_NAME}/hrgoat-allinone.tar.gz /home/ubuntu/xdr_install/
                                        chmod 644 /home/ubuntu/xdr_install/hrgoat-allinone.tar.gz
                                    " \
                                    --output text
                                
                                # Clean up S3 bucket
                                sleep 30  # Wait for download to complete
                                aws s3 rm s3://\${BUCKET_NAME}/hrgoat-allinone.tar.gz
                                aws s3 rb s3://\${BUCKET_NAME}
                            fi
                            
                            # Run the XDR installation script
                            chmod +x scripts/install-xdr-agent.sh
                            ./scripts/install-xdr-agent.sh ${env.EC2_INSTANCE_ID}
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 