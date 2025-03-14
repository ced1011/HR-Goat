pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-east-1'
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
                        
                        // Build and tag Docker image
                        DOCKER_IMAGE = "${env.ECR_REPOSITORY}:${env.BUILD_NUMBER}"
                        sh "docker build -t ${DOCKER_IMAGE} ."
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
                                
                                # Run the container with environment variables
                                docker run -d \\
                                --privileged \\
                                --name hrportal \\
                                -p 3000:3000 \\
                                -e DB_HOST='${env.RDS_HOST}' \\
                                -e DB_USER='${env.RDS_USER}' \\
                                -e DB_PASSWORD='${env.RDS_PASSWORD}' \\
                                -e DB_NAME='${env.RDS_DATABASE}' \\
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