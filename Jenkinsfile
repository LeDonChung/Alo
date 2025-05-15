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
                sh 'docker-compose build'
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


        stage('Deploy to DigitalOcean') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ocean-ssh', keyFileVariable: 'KEY', usernameVariable: 'USER'),
                    usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')
                ]) {
                    sh """
                        scp -i $KEY -o StrictHostKeyChecking=no .env $USER@$remoteHost:${deployDir}/.env || true
                     """

                    sh """
                        ssh -i $KEY -o StrictHostKeyChecking=no $USER@$OCEAN_HOST << EOF
                        set -e

                        if [ ! -d "$DEPLOY_DIR" ]; then
                            git clone -b $BRANCH_DEPLOY https://github.com/LeDonChung/Alo.git $DEPLOY_DIR
                        else
                            cd $DEPLOY_DIR
                            git fetch origin
                            git checkout $BRANCH_DEPLOY
                            git pull origin $BRANCH_DEPLOY
                        fi

                        cd $DEPLOY_DIR
                        echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
                        docker-compose -f docker-compose.deploy.yml --env-file .env down
                        docker-compose -f docker-compose.deploy.yml --env-file .env pull
                        docker-compose -f docker-compose.deploy.yml --env-file .env up -d
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout'
            script {
                sh """
                for image in \$(docker images --format '{{.Repository}}:{{.Tag}}' | grep '^${DOCKER_HUB_REPO}/'); do
                    repo=\$(echo \$image | cut -d':' -f1)
                    tag=\$(echo \$image | cut -d':' -f2)
                    if [[ "\$tag" =~ ^[0-9]+\$ ]] && [ "\$tag" -lt ${BUILD_NUMBER} ]; then
                        docker rmi "\$repo:\$tag" || true
                    fi
                done
                """
            }
        }
    }
}
