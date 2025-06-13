# Atv4_Kubernetes_Jenkins_CompassUOL

## Descrição do Projeto
Este projeto demonstra a implementação de um pipeline CI/CD utilizando Jenkins para automatizar o build, push de imagens Docker e deploy em um cluster Kubernetes. O sistema consiste em uma aplicação frontend e backend, gerenciadas através de um cluster Kubernetes configurado com kubeadm.

## Tecnologias Utilizadas

### **Orquestração e Containers**
- **Kubernetes**: Orquestração de containers
- **Docker**: Containerização das aplicações
- **Docker Hub**: Registry para armazenamento das imagens Docker

### **CI/CD**
- **Jenkins**: Automação do pipeline de entrega contínua
- **GitHub**: Versionamento de código e trigger de builds via webhook

### **Infraestrutura**
- **kubeadm**: Ferramenta para configuração do cluster Kubernetes
- **Calico**: CNI (Container Network Interface)
- **Ingress-Nginx**: Ingress Controller
- **Virt-manager (KVM/QEMU)**: Virtualização das máquinas

### **Aplicação**
- **FastAPI**: Backend da aplicação
- **HTML/CSS/JS**: Frontend da aplicação

## Configuração do Ambiente

### Pré-requisitos
- Máquinas virtuais configuradas conforme especificações abaixo
- Acesso root/sudo nas máquinas
- Conexão de rede entre as VMs

### Especificações das Máquinas Virtuais

#### Cluster Kubernetes
| Hostname      | vCPU | RAM  | Disco | IP              |
|---------------|------|------|-------|-----------------|
| control-plane | 2    | 2GB  | 25GB  | 192.168.123.100 |
| work-node01   | 2    | 1.5GB| 25GB  | 192.168.123.101 |
| work-node02   | 2    | 1.5GB| 25GB  | 192.168.123.102 |

#### Servidor Jenkins
| Hostname   | vCPU | RAM  | Disco | IP              |
|------------|------|------|-------|-----------------|
| jenkins01  | 2    | 1.5GB| 25GB  | 192.168.123.103 |

![image](https://github.com/user-attachments/assets/77be63d3-ef91-445a-830c-0491777523cd)


## Pipeline CI/CD

### Fluxo do Pipeline
1. **Checkout**: Obtém o código fonte do repositório Git
2. **Build**: Constrói as imagens Docker para frontend e backend
3. **Push**: Envia as imagens para o Docker Hub
4. **Deploy**: 
   - Cria namespace no Kubernetes
   - Implanta as aplicações (frontend e backend)
   - Configura o Ingress

### Triggers do Pipeline
- Poll SCM: Verifica mudanças no repositório periodicamente
- GitHub Webhook: Dispara o pipeline quando há push no repositório
- Execução manual

### Credenciais Configuradas
- Acesso ao Docker Hub (`dockerhub`)
- Configuração do Kubernetes (`kubeconfig`)

## Como Executar

1. **Configurar o Cluster Kubernetes**:
   
   Seguir instruções em [cluster-kubernetes](cluster-kubernetes.md)
   

2. **Configurar o Jenkins**:
   
   Seguir instruções em [jenkins](jenkins.md)
