pipeline {
    agent any

    environment {
        BRANCH_DEPLOY = 'test-deploy'
        OCEAN_HOST = "68.183.184.48"
        DOCKER_HUB_REPO = 'ledonchung'
        SERVICES = 'alo-nodejs-backend alo-socket-server'
        DEPLOY_USER = 'root' 
        DEPLOY_DIR = "/home/${DEPLOY_USER}/alo"
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo "=== Checkout branch ${BRANCH_DEPLOY} from GitHub ==="
                git branch: "${BRANCH_DEPLOY}", url: 'https://github.com/LeDonChung/Alo.git'
            }
        }
        stage('Load .env') {
            steps {
                echo "=== Load .env file from Jenkins Credentials ==="
                withCredentials([file(credentialsId: 'env-alo', variable: 'ENV_FILE')]) {
                    sh '''
                        rm -f .env
                        cp "$ENV_FILE" .env
                        ls -l .env
                        echo "Content of .env:"
                        cat .env
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "=== Build Docker Images with no cache ==="
                sh '''
                    set -x
                    docker-compose --env-file .env build --no-cache
                    docker images
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    echo "=== Login Docker Hub ==="
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'

                    script {
                        def services = env.SERVICES.split(" ")
                        for (svc in services) {
                            def localImage = "${svc}:latest"  // Tên image theo docker-compose mặc định
                            def remoteImage = "${DOCKER_HUB_REPO}/${svc}"

                            echo "Tagging local image ${localImage} to ${remoteImage}:${env.BUILD_NUMBER} and latest"
                            sh "docker tag ${localImage} ${remoteImage}:${env.BUILD_NUMBER}"
                            sh "docker tag ${localImage} ${remoteImage}:latest"

                            echo "Pushing image ${remoteImage}:${env.BUILD_NUMBER}"
                            sh "docker push ${remoteImage}:${env.BUILD_NUMBER}"

                            echo "Pushing image ${remoteImage}:latest"
                            sh "docker push ${remoteImage}:latest"
                        }
                    }
                }
            }
        }

        stage('Deploy to Ocean') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ocean-ssh', keyFileVariable: 'KEY', usernameVariable: 'USER'),
                    usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')
                ]) {
                    echo "=== Copy .env and deploy to remote server ${OCEAN_HOST} ==="
                    script {
                        def remoteHost = env.OCEAN_HOST
                        def deployDir = env.DEPLOY_DIR

                        sh """
                            set -x
                            scp -i $KEY -o StrictHostKeyChecking=no .env $USER@$remoteHost:${deployDir}/.env || true
                        """

                        sh """
                            ssh -i $KEY -o StrictHostKeyChecking=no $USER@$remoteHost << EOF
                            set -ex

                            if [ ! -d "${deployDir}" ]; then
                                git clone -b ${BRANCH_DEPLOY} https://github.com/LeDonChung/Alo.git ${deployDir}
                            else
                                cd ${deployDir}
                                git fetch origin
                                git checkout ${BRANCH_DEPLOY}
                                git pull origin ${BRANCH_DEPLOY}
                            fi

                            cd ${deployDir}

                            echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

                            docker-compose -f docker-compose.deploy.yml --env-file .env down

                            docker-compose -f docker-compose.deploy.yml --env-file .env pull

                            docker-compose -f docker-compose.deploy.yml --env-file .env up -d
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "=== Logout Docker ==="
            sh 'docker logout || true'
        }
    }
}
