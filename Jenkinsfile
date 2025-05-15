pipeline {
    agent any

    environment {
        BRANCH_DEPLOY = 'test-deploy'
        OCEAN_HOST = "68.183.184.48"
        DOCKER_HUB_REPO = 'ledonchung'
        SERVICES = 'alo-web-frontend alo-nodejs-backend alo-socket-server'
        DEPLOY_DIR = '/home/$USER/alo'
    }

    stages {
        stage('Checkout Source') {
            steps {
                git branch: "${BRANCH_DEPLOY}", url: 'https://github.com/LeDonChung/Alo.git'
            }
        }
        stage('Load .env') {
            steps {
                withCredentials([file(credentialsId: 'env-alo', variable: 'ENV_FILE')]) {
                    sh 'rm -f .env'
                    sh 'cp "$ENV_FILE" .env'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker-compose --env-file .env build'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'

                    script {
                        def services = env.SERVICES.split()
                        for (svc in services) {
                            def image = "${DOCKER_HUB_REPO}/${svc}"
                            sh "docker tag ${svc} ${image}:${env.BUILD_NUMBER}"
                            sh "docker tag ${svc} ${image}:latest"          // Thêm dòng này
                            sh "docker push ${image}:${env.BUILD_NUMBER}"
                            sh "docker push ${image}:latest"
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
                    script {
                        def remoteHost = env.OCEAN_HOST
                        def deployDir = "/home/$USER/alo"

                        // Gửi file .env từ Jenkins sang Ocean
                        sh """
                            scp -i $KEY -o StrictHostKeyChecking=no .env $USER@$remoteHost:${deployDir}/.env || true
                        """

                        // SSH vào server để deploy
                        sh """
                            ssh -i $KEY -o StrictHostKeyChecking=no $USER@$remoteHost << EOF
                            set -e

                            if [ ! -d "${deployDir}" ]; then
                                git clone -b ${BRANCH_DEPLOY} https://github.com/LeDonChung/CardioTrackBackend.git ${deployDir}
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
            sh 'docker logout'
        }
    }
}
