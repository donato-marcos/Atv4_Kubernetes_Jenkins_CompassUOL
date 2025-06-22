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
        CURRENT_DATE = sh(script: 'date +%Y/%m/%d', returnStdout: true).trim()
    }

    stages {
        stage('Get Commit Hashes') {
            steps {
                script {
                    env.BACKEND_HASH = sh(script: 'git log -n 1 --pretty=format:%h -- backend/', returnStdout: true).trim()
                    env.FRONTEND_HASH = sh(script: 'git log -n 1 --pretty=format:%h -- frontend/', returnStdout: true).trim()
                    
                    env.BACKEND_TAG = "${env.CURRENT_DATE}-${env.BACKEND_HASH}"
                    env.FRONTEND_TAG = "${env.CURRENT_DATE}-${env.FRONTEND_HASH}"
                }
            }
        }

        stage('Build Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                script {
                    backendapp = docker.build("${env.DOCKER_USER}/atv4_backend:${env.BACKEND_TAG}", '--no-cache -f ./backend/Dockerfile ./backend')
                }
            }
        }

        stage('Build Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                script {
                    frontendapp = docker.build("${env.DOCKER_USER}/atv4_frontend:${env.FRONTEND_TAG}", '--no-cache -f ./frontend/Dockerfile ./frontend')
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
                                backendapp.push("${env.BACKEND_TAG}")
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
                                frontendapp.push("${env.FRONTEND_TAG}")
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
                    when {
                        anyOf {
                            changeset "backend/**"
                            changeset "k8s/backend.yaml"
                        }
                    }
                    steps {
                        script {
                            withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                                sh "sed -i 's/{{tag}}/${env.BACKEND_TAG}/g' ./k8s/backend.yaml"
                                sh 'kubectl apply -f k8s/backend.yaml'
                            }
                        }
                    }
                }
                stage('Deploy Frontend') {
                    when {
                        anyOf {
                            changeset "frontend/**"
                            changeset "k8s/frontend.yaml"
                        }
                    }
                    steps {
                        script {
                            withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                                sh "sed -i 's/{{tag}}/${env.FRONTEND_TAG}/g' ./k8s/frontend.yaml"
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
