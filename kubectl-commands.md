# Hướng Dẫn Sử Dụng Kubectl

Tài liệu này tổng hợp các lệnh kubectl thường dùng để quản lý và debug ứng dụng NestJS chạy trên Kubernetes.

## Lệnh Cơ Bản

### Kiểm tra thông tin chung

```bash
# Kiểm tra thông tin cluster
kubectl cluster-info

# Liệt kê các nodes trong cluster
kubectl get nodes

# Liệt kê tất cả các namespaces
kubectl get namespaces
```

### Quản lý resources

```bash
# Liệt kê tất cả resources trong namespace
kubectl get all -n <namespace>

# Liệt kê các pods
kubectl get pods -n <namespace>

# Liệt kê các services
kubectl get services -n <namespace>

# Liệt kê các deployments
kubectl get deployments -n <namespace>

# Liệt kê các configmaps
kubectl get configmaps -n <namespace>

# Liệt kê các secrets
kubectl get secrets -n <namespace>
```

## Kiểm Tra Ứng Dụng NestJS

### Kiểm tra môi trường dev

```bash
# Kiểm tra tất cả resources trong namespace dev
kubectl get all -n nestjs-app-dev

# Kiểm tra chi tiết deployment
kubectl describe deployment nestjs-app -n nestjs-app-dev

# Kiểm tra chi tiết service
kubectl describe service nestjs-app -n nestjs-app-dev
```

### Kiểm tra môi trường production

```bash
# Kiểm tra tất cả resources trong namespace production
kubectl get all -n nestjs-app

# Kiểm tra chi tiết deployment
kubectl describe deployment nestjs-app -n nestjs-app

# Kiểm tra chi tiết service
kubectl describe service nestjs-app -n nestjs-app
```

## Truy Cập và Debug Logs

### Xem logs

```bash
# Xem logs của pod
kubectl logs <pod-name> -n <namespace>

# Xem logs theo dõi liên tục (stream)
kubectl logs -f <pod-name> -n <namespace>

# Xem logs của container cụ thể trong pod (nếu pod có nhiều containers)
kubectl logs <pod-name> -c <container-name> -n <namespace>

# Xem logs từ tất cả các pods của một deployment
kubectl logs -f deployment/<deployment-name> -n <namespace>
```

### Truy cập vào pod (shell)

```bash
# Truy cập shell của pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

# Truy cập shell của container cụ thể trong pod
kubectl exec -it <pod-name> -c <container-name> -n <namespace> -- /bin/sh

# Chạy lệnh đơn trong pod mà không vào shell
kubectl exec <pod-name> -n <namespace> -- <command>
```

## Port-Forward và Truy Cập Ứng Dụng

```bash
# Port-forward để truy cập service từ localhost
kubectl port-forward service/<service-name> <local-port>:<service-port> -n <namespace>

# Ví dụ port-forward cho ứng dụng NestJS dev
kubectl port-forward service/nestjs-app 3000:80 -n nestjs-app-dev

# Ví dụ port-forward cho ứng dụng NestJS production
kubectl port-forward service/nestjs-app 3001:80 -n nestjs-app
```

## Quản Lý Argo CD

```bash
# Xem tất cả ứng dụng Argo CD
kubectl get applications -n argocd

# Xem chi tiết ứng dụng trong Argo CD
kubectl describe application <app-name> -n argocd

# Port-forward để truy cập UI Argo CD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Đăng nhập vào Argo CD
argocd login 146.190.4.238 --username admin --password EZx84T5ly-uMfeVb --insecure
argocd app list
```

## Các Lệnh Mở Rộng

### Kiểm tra tài nguyên sử dụng

```bash
# Xem sử dụng tài nguyên của các pods
kubectl top pods -n <namespace>

# Xem sử dụng tài nguyên của các nodes
kubectl top nodes
```

### Cập nhật và patch resources

```bash
# Apply file cấu hình
kubectl apply -f <file.yaml>

# Apply các files trong một thư mục
kubectl apply -f <directory/>

# Chỉnh sửa deployment với editor
kubectl edit deployment <deployment-name> -n <namespace>

# Patch resource
kubectl patch deployment <deployment-name> -n <namespace> -p '{"spec": {"replicas": 3}}'
```

### Scale ứng dụng

```bash
# Scale số replicas của deployment
kubectl scale deployment <deployment-name> --replicas=<number> -n <namespace>

# Ví dụ scale ứng dụng NestJS dev lên 3 replicas
kubectl scale deployment nestjs-app --replicas=3 -n nestjs-app-dev
```

### Khởi động lại ứng dụng

```bash
# Khởi động lại ứng dụng bằng cách rolling restart deployment
kubectl rollout restart deployment <deployment-name> -n <namespace>

# Ví dụ khởi động lại ứng dụng NestJS dev
kubectl rollout restart deployment nestjs-app -n nestjs-app-dev
```

### Xem lịch sử triển khai

```bash
# Xem lịch sử rollout của deployment
kubectl rollout history deployment <deployment-name> -n <namespace>

# Quay lại phiên bản trước đó
kubectl rollout undo deployment <deployment-name> -n <namespace>
```

## Xử Lý Sự Cố

### Kiểm tra sự cố pods

```bash
# Xem mô tả chi tiết pod để tìm lỗi
kubectl describe pod <pod-name> -n <namespace>

# Kiểm tra trạng thái các events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

### Kiểm tra network

```bash
# Debug service DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup <service-name>.<namespace>.svc.cluster.local

# Test kết nối đến service
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- <service-name>.<namespace>.svc.cluster.local:<port>
```

### Kiểm tra cấu hình

```bash
# Xem nội dung ConfigMap
kubectl get configmap <configmap-name> -n <namespace> -o yaml

# Xem nội dung Secret (đã được mã hóa base64)
kubectl get secret <secret-name> -n <namespace> -o yaml
```

## Mẹo và Thủ Thuật

### Sử dụng kubectl với đa ngữ cảnh (multiple contexts)

```bash
# Liệt kê các context
kubectl config get-contexts

# Chuyển đổi giữa các context
kubectl config use-context <context-name>

# Đặt namespace mặc định cho context
kubectl config set-context --current --namespace=<namespace>
```

### Sử dụng alias để tiết kiệm thời gian

Thêm các alias sau vào file ~/.bashrc hoặc ~/.zshrc:

```bash
# Alias ngắn cho kubectl
alias k='kubectl'

# Alias cho namespace development
alias kdev='kubectl -n nestjs-app-dev'

# Alias cho namespace production
alias kprod='kubectl -n nestjs-app'

# Alias cho lệnh get pod
alias kgp='kubectl get pods'
```

### Sử dụng kubectl với output định dạng

```bash
# Output dạng yaml
kubectl get pod <pod-name> -n <namespace> -o yaml

# Output dạng json
kubectl get pod <pod-name> -n <namespace> -o json

# Output dạng tùy chỉnh sử dụng jsonpath
kubectl get pods -n <namespace> -o jsonpath='{.items[*].metadata.name}'
```

## Tổng Kết

Các lệnh trên là những lệnh kubectl cơ bản và hữu ích nhất để quản lý ứng dụng NestJS trên Kubernetes. Khi gặp sự cố, hãy tham khảo thêm [Hướng Dẫn Xử Lý Sự Cố](./troubleshooting-guide.md) để tìm giải pháp chi tiết cho vấn đề cụ thể.

Nếu cần thêm thông tin về kubectl, hãy tham khảo [tài liệu chính thức của Kubernetes](https://kubernetes.io/docs/reference/kubectl/cheatsheet/).
