# Procedimento para Configuração do Pipeline Jenkins

## 1. Pré-requisitos

- Cluster Kubernetes configurado conforme `cluster-kubernetes.md`
- Servidor Jenkins instalado conforme `jenkins.md`
- Repositório Git com a estrutura do projeto (frontend, backend, k8s)
- Credenciais de acesso ao Docker Hub e ao cluster Kubernetes

## 2. Configuração Inicial do Jenkins

1. **Acessar o Jenkins**:
   - Acesse a interface web (http://[IP_JENKINS]:8080)
   - Faça login com as credenciais (imagem `001-login.png`)

2. **Criar um novo item**:
   - Clique em "New Item"
   - Selecione "Pipeline" (imagem `002-pipeline.png`)
   - Digite um nome para o pipeline (ex: "deploy-kubernetes")
   - Clique em "OK"

## 3. Configuração do Pipeline

1. **Definição do Pipeline** (imagem `005-pipeline_pipeline.png`):
   - Selecione "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: `https://github.com/donato-marcos/Atv4_Kubernetes_Jenkins_CompassUOL.git`
   - Branch: `main`
   - Script Path: `Jenkinsfile`

2. **Configurar Triggers** (imagem `003-pipeline_triggers.png`):
   - Marque "GitHub hook trigger for GITScm polling"
   - Marque "Poll SCM"
   - Configure o intervalo de polling se necessário

## 4. Configuração de Credenciais

1. **Credenciais do Docker Hub** (imagem `007-credential_user_password_dockerhub.png`):
   - Acesse "Manage Jenkins" > "Credentials"
   - Adicione nova credencial do tipo "Username with password"
   - Scope: Global
   - Username: seu usuário Docker Hub
   - Password: sua senha Docker Hub
   - ID: `dockerhub` (como referenciado no Jenkinsfile)

2. **Credenciais do Kubernetes** (imagem `008-credential_secrete-file_cluster-kubernetes.png`):
   - Adicione nova credencial do tipo "Secret file"
   - Faça upload do arquivo `kubeconfig` do seu cluster
   - ID: `kubeconfig` (como referenciado no Jenkinsfile)

## 5. Estrutura do Pipeline (Jenkinsfile)

O pipeline está definido no arquivo `Jenkinsfile.txt` e possui os seguintes estágios:

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
- Manualmente (como mostrado nas imagens `009-pipeline-overview-8.png`, `010-pipeline-overview-9.png`, etc.)
- Automaticamente quando há mudanças no repositório Git

## 7. Monitoramento

Após a execução, é possível verificar:
- O gráfico de execução (imagens `011-pipeline-overview-21.png`, `012-pipeline-overview-31.png`, etc.)
- O status de cada estágio
- O tempo de execução

## 8. Verificação da Aplicação

Após o deploy bem-sucedido, a aplicação estará disponível conforme mostrado na imagem `014-app-funcionando.png`.

## Observações

- O pipeline está configurado para executar apenas os estágios necessários com base nas mudanças detectadas (usando diretivas `when` e `changeset`)
- As credenciais são referenciadas no Jenkinsfile através de variáveis de ambiente
- O deploy no Kubernetes é feito usando o kubectl com as credenciais configuradas

