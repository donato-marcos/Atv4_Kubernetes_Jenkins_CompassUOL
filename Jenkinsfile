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
            when {
                changeset "backend/**"
            }
            steps {
                script {
                    backendapp = docker.build("${env.DOCKER_USER}/atv4_backend:${env.BUILD_ID}", '--no-cache -f ./backend/Dockerfile ./backend')
                }
            }
        }

        stage('Build Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                script {
                    frontendapp = docker.build("${env.DOCKER_USER}/atv4_frontend:${env.BUILD_ID}", '--no-cache -f ./frontend/Dockerfile ./frontend')
                }
            }
        }

        stage('Push Images') {
            parallel {
                stage('Push Backend') {
                    when {
                        changeset "backend/**"
                    }
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
                    when {
                        changeset "frontend/**"
                    }
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

        stage('Create Namespace') {
            when {
                changeset "k8s/namespace.yaml"
            }
            steps {
                withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                    sh 'kubectl apply -f k8s/namespace.yaml'
                }
            }
        }

        stage('Deploy Applications') {
            parallel {
                stage('Deploy Backend') {
                    steps {
                        script {
                            withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                                sh "sed -i 's/{{tag}}/${env.BUILD_ID}/g' ./k8s/backend.yaml"
                                sh 'kubectl apply -f k8s/backend.yaml'
                            }
                        }
                    }
                }
                stage('Deploy Frontend') {
                    steps {
                        script {
                            withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                                sh "sed -i 's/{{tag}}/${env.BUILD_ID}/g' ./k8s/frontend.yaml"
                                sh 'kubectl apply -f k8s/frontend.yaml'
                            }
                        }
                    }
                }
                stage('Deploy Ingress') {
                    when {
                        changeset "k8s/ingress.yaml"
                    }
                    steps {
                        withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                            sh 'kubectl apply -f k8s/ingress.yaml'
                        }
                    }
                }
            }
        }
    }
}
