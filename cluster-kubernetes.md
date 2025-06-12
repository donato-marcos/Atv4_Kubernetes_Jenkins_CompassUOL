# Configuração de Cluster Kubernetes com kubeadm

Este guia fornece instruções para configurar um cluster Kubernetes usando kubeadm com um nó control-plane e dois nós worker.

## Sumário
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Especificações das Máquinas Virtuais](#especificações-das-máquinas-virtuais)
- [Instruções de Configuração](#instruções-de-configuração)
  - [Pré-requisitos (Todos os Nós)](#pré-requisitos-todos-os-nós)
  - [Configuração do Control-Plane](#configuração-do-control-plane)
  - [Configuração dos Worker Nodes](#configuração-dos-worker-nodes)
- [CNI e Ingress Controller](#cni-e-ingress-controller)

## Tecnologias Utilizadas
- **Virt-manager** (KVM/QEMU/Libvirt)
- **Kubernetes**

## Especificações das Máquinas Virtuais


| Hostname      | vCPU | vRAM      | vDISK | IP              |
|---------------|------|-----------|-------|-----------------|
| control-plane | 2    | 2GB       | 25GB  | 192.168.123.100 |
| work-node01   | 2    | 1GB~1.5GB | 25GB  | 192.168.123.101 |
| work-node02   | 2    | 1GB~1.5GB | 25GB  | 192.168.123.102 |

## Instruções de Configuração

### Pré-requisitos (Todos os Nós)

1. **Definir Hostname**  
   Execute o comando apropriado para cada nó:  
   ```bash
   sudo hostnamectl hostname control-plane  # Para o control-plane
   sudo hostnamectl hostname work-node01    # Para o worker 1
   sudo hostnamectl hostname work-node02    # Para o worker 2
   ```

2. **Desativar Swap**  
   ```bash
   sudo sed -i '/swap/d' /etc/fstab
   sudo swapoff -a
   ```

3. **Configurar Módulos do Kernel**  
   ```bash
   cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
   overlay
   br_netfilter
   EOF
   sudo modprobe overlay
   sudo modprobe br_netfilter
   ```

4. **Configurar Rede**  
   ```bash
   cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
   net.bridge.bridge-nf-call-iptables = 1
   net.ipv4.ip_forward = 1
   net.bridge.bridge-nf-call-ip6tables = 1
   EOF
   sudo sysctl --system
   ```

5. **Instalar Containerd**  
   ```bash
   sudo apt-get update
   sudo apt-get install ca-certificates curl gpg gnupg --yes
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   sudo chmod a+r /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install containerd.io -y
   sudo systemctl enable --now containerd
   ```

6. **Configurar Containerd**  
   ```bash
   sudo mkdir -p /etc/containerd
   containerd config default | sudo tee /etc/containerd/config.toml
   sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
   sudo systemctl restart containerd
   ```

7. **Instalar Ferramentas do Kubernetes**  
   ```bash
   sudo apt-get update
   sudo apt-get install -y apt-transport-https ca-certificates curl gpg gnupg
   curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
   echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
   sudo apt-get update
   sudo apt-get install -y kubelet kubeadm kubectl
   sudo apt-mark hold kubelet kubeadm kubectl
   ```

### Configuração do Control-Plane

1. **Inicializar o Cluster**  
   ```bash
   sudo kubeadm init
   ```

2. **Configurar kubectl**  
   ```bash
   mkdir -p $HOME/.kube
   sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
   sudo chown $(id -u):$(id -g) $HOME/.kube/config
   ```

3. **Gerar Comando de Join**  
   ```bash
   kubeadm token create --print-join-command
   ```
   Salve o resultado para adicionar os nós worker.

### Configuração dos Worker Nodes

1. **Entrar no Cluster**  
   Execute o comando de join gerado no control-plane em cada worker node:  
   ```bash
   sudo kubeadm join <ip-do-control-plane>:6443 --token <token> --discovery-token-ca-cert-hash <hash>
   ```

## CNI e Ingress Controller

1. **Instalar Calico CNI**  
   Execute no control-plane:  
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.0/manifests/calico.yaml
   ```

2. **Instalar Ingress Controller**  
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/baremetal/deploy.yaml
   kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "NodePort"}}'
   ```

## Próximos Passos
- Verifique o status do cluster com
  - `kubectl get nodes`
- Verificar pods do sistema com
  - `kubectl get pods -n kube-system`
- Verificar se o Ingress Controller com
  - `kubectl get pods -n ingress-nginx`
- Listar serviços do Ingress Controller com
  - `kubectl get svc -n ingress-nginx`
- Teste DNS interno
  - `kubectl run -it --rm --image=busybox:1.28 test-dns -- nslookup kubernetes.default`


Para mais detalhes, consulte a [documentação oficial do Kubernetes](https://kubernetes.io/docs/setup/).
``` 
