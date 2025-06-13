# Procedimento para Configuração do Pipeline Jenkins

## 1. Pré-requisitos

- Cluster Kubernetes configurado conforme [cluster-kubernetes.md](cluster-kubernetes.md)
- Servidor Jenkins instalado conforme [jenkins.md](jenkins.md)
- Repositório Git com a estrutura do projeto (frontend, backend, k8s)
- Credenciais de acesso ao Docker Hub e ao cluster Kubernetes

## 2. Configuração Inicial do Jenkins

1. **Acessar o Jenkins**:
   - Acesse a interface web (http://[IP_JENKINS]:8080)
   - Faça login com as credenciais
   ![001-login](https://github.com/user-attachments/assets/463e5d57-b08c-4a8a-9d9a-aa5170e99bd4)


2. **Criar um novo item**:
   - Clique em "New Item"
   - Selecione "Pipeline"
   ![002-pipeline](https://github.com/user-attachments/assets/634534ff-f203-4d6c-a144-745c8691f1d7)

   - Digite um nome para o pipeline (ex: "deploy-kubernetes")
   - Clique em "OK"

## 3. Configuração do Pipeline

1. **Definição do Pipeline**:
   ![005-pipeline_pipeline](https://github.com/user-attachments/assets/05487216-f2d5-4f2f-ba81-a109501ddebd)

   - Selecione "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: `https://github.com/donato-marcos/Atv4_Kubernetes_Jenkins_CompassUOL.git`
   - Branch: `main`
   - Script Path: `Jenkinsfile`

2. **Configurar Triggers**:
   
   ![003-pipeline_triggers](https://github.com/user-attachments/assets/edfcf3da-38cc-442f-ab5b-ce92f4ffe2fd)

   - Marque "GitHub hook trigger for GITScm polling"
   - Marque "Poll SCM"
   - Configure o intervalo de polling se necessário

## 4. Configuração de Credenciais

1. **Credenciais do Docker Hub**:
   ![007-credential_user_password_dockerhub](https://github.com/user-attachments/assets/78d88f18-55fa-4615-a8e7-5558139480b7)

   - Acesse "Manage Jenkins" > "Credentials"
   - Adicione nova credencial do tipo "Username with password"
   - Scope: Global
   - Username: seu usuário Docker Hub
   - Password: sua senha Docker Hub
   - ID: `dockerhub` (como referenciado no Jenkinsfile)

2. **Credenciais do Kubernetes**:
   ![008-credential_secrete-file_cluster-kubernetes](https://github.com/user-attachments/assets/ecacd875-dbe8-4fd8-ac27-28157bb199c7)

   - Adicione nova credencial do tipo "Secret file"
   - Faça upload do arquivo `kubeconfig` do seu cluster
   - ID: `kubeconfig` (como referenciado no Jenkinsfile)

## 5. Estrutura do Pipeline (Jenkinsfile)

O pipeline está definido no arquivo `Jenkinsfile` e possui os seguintes estágios:

1. **Build Backend**: Constrói a imagem Docker do backend quando há mudanças na pasta backend/
2. **Build Frontend**: Constrói a imagem Docker do frontend quando há mudanças na pasta frontend/
3. **Push Images**: Envia as imagens para o Docker Hub
4. **Create Namespace**: Cria o namespace no Kubernetes quando há mudanças no arquivo namespace.yaml
5. **Deploy Applications**: Implanta os aplicativos no cluster Kubernetes:
   - Backend (quando há mudanças no backend ou no arquivo backend.yaml)
   - Frontend (quando há mudanças no frontend ou no arquivo frontend.yaml)
   - Ingress (quando há mudanças no arquivo ingress.yaml)

## 6. Execução do Pipeline

O pipeline pode ser executado:
- Manualmente, como mostrado nas imagens:
![009-pipeline-overview-8](https://github.com/user-attachments/assets/f60a5c22-76bd-472a-9b39-2d6ab287f056)
![010-pipeline-overview-9](https://github.com/user-attachments/assets/6a8e9685-2fca-4887-a81a-c621c209e426)

- Automaticamente quando há mudanças no repositório Git

## 7. Monitoramento

Após a execução, é possível verificar:
- O gráfico de execução:
![011-pipeline-overview-21](https://github.com/user-attachments/assets/8bdffa67-55c4-4f94-9bbd-bae8163f8c80)
![012-pipeline-overview-31](https://github.com/user-attachments/assets/3fc8372d-98e1-4e18-8364-22a92c304f65)

- O status de cada estágio
- O tempo de execução

## 8. Verificação da Aplicação

Após o deploy bem-sucedido, a aplicação estará disponível conforme mostrado na imagem:
![014-app-funcionando](https://github.com/user-attachments/assets/51b2ad6f-423d-4463-bdd3-8a90b03ade08)


## Observações

- O pipeline está configurado para executar apenas os estágios necessários com base nas mudanças detectadas (usando diretivas `when` e `changeset`)
- As credenciais são referenciadas no Jenkinsfile através de variáveis de ambiente
- O deploy no Kubernetes é feito usando o kubectl com as credenciais configuradas

