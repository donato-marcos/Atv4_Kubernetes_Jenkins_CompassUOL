# Configuração do Jenkins  

Este guia fornece instruções para configurar um servidor Jenkins

## Sumário  
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Especificações da Máquina Virtual](#especificações-da-máquina-virtual)
- [Guia de Instalação](#guia-de-instalação)
  - [Java (JDK 17)](#java-jdk-17)
  - [Jenkins](#jenkins)
  - [Docker](#docker)
  - [Kubectl](#kubectl)
- [Chave de Segurança](#chave-de-segurança)

- ### [Configuração do pipeline](configuracao-pipeline_jenkins.md)

---  

## Tecnologias Utilizadas  
- **Virt-manager** (KVM/QEMU/Libvirt)
- **Jenkins**

## Especificações da Máquina Virtual  

| Hostname   | vCPU | vRAM       | Disco Virtual | IP             |
|------------|------|------------|--------------|-----------------|
| jenkins01  | 2    | 1GB~1.5GB  | 25GB         | 192.168.123.103 |

---

## Guia de Instalação

### Jenkins
Siga os passos abaixo para instalar o Jenkins:

1. Adicione a chave do Jenkins ao sistema:
   ```bash
   sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
     https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key 
   ```

2. Adicione o repositório do Jenkins à lista de fontes do apt:
   ```bash
   echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
   ```

3. Atualize os pacotes e instale o Jenkins:
   ```bash
   sudo apt-get update && sudo apt-get install -y jenkins
   ```

### Java (JDK 21)
Para instalar o Java JDK 21, execute o comando:
```bash
sudo apt update && sudo apt install -y openjdk-21-jre
```

### Docker
Siga os passos abaixo para instalar o Docker:

1. Adicione a chave GPG oficial do Docker:
   ```bash
   sudo apt-get update
   sudo apt-get install ca-certificates curl  
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc
   ```

2. Adicione o repositório do Docker:
   ```bash
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   ```

3. Instale o Docker e seus componentes:
   ```bash
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
   ```

4. Adicione o usuário atual e o usuário Jenkins ao grupo Docker:
   ```bash
   sudo usermod -aG docker $USER
   sudo usermod -aG docker jenkins
   ```

5. Reinicie o Jenkins para aplicar as permissões:
   ```bash
   sudo systemctl restart jenkins
   ```

### Kubectl
Siga os passos abaixo para instalar o kubectl:

1. Adicione as chaves e repositórios necessários:
   ```bash
   sudo apt-get update
   sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

   curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
   sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg
   ```

2. Adicione o repositório do Kubernetes:
   ```bash
   echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
   sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list
   ```

3. Atualize os pacotes e instale o kubectl:
   ```bash
   sudo apt-get update
   sudo apt-get install -y kubectl
   ```

---

## Chave de Segurança
Para obter a senha inicial de administrador do Jenkins, execute:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
