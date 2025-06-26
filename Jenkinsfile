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
        CURRENT_DATE = sh(script: 'date +%Y%m%d', returnStdout: true).trim()
    }

    stages {

        stage('Detect Tags from Kubernetes') {
            steps {
                script {
                    env.NAMESPACE = 'atv4-compassuol'
                    withKubeConfig([credentialsId: env.KUBE_CREDENTIALS]) {
                        env.BACKEND_TAG = sh(
                            script: "kubectl get deployment backend -n ${env.NAMESPACE} -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null | cut -d: -f2 || true",
                            returnStdout: true
                        ).trim()

                        echo "Tag atual no cluster (backend): ${env.BACKEND_TAG}"

                        env.FRONTEND_TAG = sh(
                            script: "kubectl get deployment frontend -n ${env.NAMESPACE} -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null | cut -d: -f2 || true",
                            returnStdout: true
                        ).trim()

                        echo "Tag atual no cluster (frontend): ${env.FRONTEND_TAG}"
                    }
                }
            }
        }

        stage('Get Commit Hashes') {
            steps {
                script {
                    env.BACKEND_HASH = sh(script: 'git log -n 1 --pretty=format:%h -- backend/', returnStdout: true).trim()
                    env.BACKEND_BUILT = "false"

                    echo "Hash atual no github (backend): ${env.BACKEND_HASH}"

                    env.FRONTEND_HASH = sh(script: 'git log -n 1 --pretty=format:%h -- frontend/', returnStdout: true).trim()
                    env.FRONTEND_BUILT = "false"

                    echo "Hash atual no github (frontend): ${env.FRONTEND_HASH}"
                }
            }
        }

        stage('Build Backend') {
            when {
                anyOf {
                    changeset "backend/**"
                    expression { return !env.BACKEND_TAG }
                }
            }
            steps {
                script {
                    env.BACKEND_TAG = "${env.CURRENT_DATE}-${env.BACKEND_HASH}-${env.BUILD_NUMBER}"
                    backendapp = docker.build("${env.DOCKER_USER}/atv4_backend:${env.BACKEND_TAG}", '--no-cache -f ./backend/Dockerfile ./backend')
                    env.BACKEND_BUILT = "true"
                }
            }
        }

        stage('Build Frontend') {
            when {
                anyOf {
                    changeset "frontend/**"
                    expression { return !env.FRONTEND_TAG }
                }
            }
            steps {
                script {
                    env.FRONTEND_TAG = "${env.CURRENT_DATE}-${env.FRONTEND_HASH}-${env.BUILD_NUMBER}"
                    frontendapp = docker.build("${env.DOCKER_USER}/atv4_frontend:${env.FRONTEND_TAG}", '--no-cache -f ./frontend/Dockerfile ./frontend')
                    env.FRONTEND_BUILT = "true"
                }
            }
        }

        stage('Push Images') {
            parallel {
                stage('Push Backend') {
                    when {
                        expression { return env.BACKEND_BUILT == "true" }
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
                        expression { return env.FRONTEND_BUILT == "true" }
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
                            changeset "k8s/backend.yaml"
                            expression { return env.BACKEND_BUILT == "true" }
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
                            changeset "k8s/frontend.yaml"
                            expression { return env.FRONTEND_BUILT == "true" }
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
