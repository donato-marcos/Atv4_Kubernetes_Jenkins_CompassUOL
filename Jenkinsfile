pipeline {
    agent any


    triggers {
        pollSCM('')
    }


    environment {
        DOCKER_REGISTRY = 'registry.hub.docker.com'
        DOCKER_USER = 'aesthar'
        DOCKER_CREDENTIALS = 'dockerhub'
        KUBE_CREDENTIALS = 'kubeconfig'
    }

    stages {
        stage('Build Backend') {
            steps {
                script {
                    backendapp = docker.build("${env.DOCKER_USER}/atv4_backend:${env.BUILD_ID}", '--no-cache -f ./backend/Dockerfile ./backend')
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    frontendapp = docker.build("${env.DOCKER_USER}/atv4_frontend:${env.BUILD_ID}", '--no-cache -f ./frontend/Dockerfile ./frontend')
                }
            }
        }

        stage('Push Images') {
            parallel {
                stage('Push Backend') {
                    steps {
                        script {
                            docker.withRegistry("https://${env.DOCKER_REGISTRY}", env.DOCKER_CREDENTIALS) {
                                backendapp.push('latest')
                                backendapp.push("${env.BUILD_ID}")
                            }
                        }
                    }
                }
                stage('Push Frontend') {
                    steps {
                        script {
                            docker.withRegistry("https://${env.DOCKER_REGISTRY}", env.DOCKER_CREDENTIALS) {
                                frontendapp.push('latest')
                                frontendapp.push("${env.BUILD_ID}")
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy no Kubernetes') {
            environment {
                tag_version = "${env.BUILD_ID}"
            }
            steps {
                withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                    sh "sed -i 's/{{tag}}/${tag_version}/g' ./k8s/backend.yaml"
                    sh 'kubectl apply -f k8s/backend.yaml'
                }
            }
            steps {
                withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                    sh "sed -i 's/{{tag}}/${tag_version}/g' ./k8s/frontend.yaml"
                    sh 'kubectl apply -f k8s/frontend.yaml'
                }
            }
        }
    }
}
