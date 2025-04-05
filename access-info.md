# Thông Tin Truy Cập Hệ Thống

File này tổng hợp tất cả các thông tin truy cập quan trọng cho hệ thống NestJS và các công cụ CI/CD.

## Argo CD

| Thông tin    | Giá trị                                                           |
| ------------ | ----------------------------------------------------------------- |
| URL truy cập | https://146.190.4.238 hoặc https://[2400:6180:0:d2:0:1:bb07:8000] |
| URL Local    | https://localhost:8080 (qua port-forward)                         |
| Username     | admin                                                             |
| Password     | EZx84T5ly-uMfeVb                                                  |
| Port-forward | `kubectl port-forward svc/argocd-server -n argocd 8080:443`       |
| Namespace    | argocd                                                            |

### Lệnh hữu ích cho Argo CD

```bash
# Đăng nhập Argo CD CLI
argocd login 146.190.4.238 --username admin --password EZx84T5ly-uMfeVb --insecure

# Xem danh sách ứng dụng
kubectl get applications -n argocd

# Xem chi tiết ứng dụng
kubectl describe application nestjs-app-dev -n argocd
kubectl describe application nestjs-app-prod -n argocd

# Khởi động lại Argo CD repo server (nếu cần)
kubectl rollout restart deployment argocd-repo-server -n argocd
```

## Ứng dụng NestJS

| Môi trường         | Namespace      | URL                                               |
| ------------------ | -------------- | ------------------------------------------------- |
| Dev                | nestjs-app-dev | Sử dụng lệnh: `kubectl get svc -n nestjs-app-dev` |
| Production         | nestjs-app     | http://157.230.194.205                            |
| Production (HTTPS) | nestjs-app     | https://nestjs.157.230.194.205.nip.io             |

### Lệnh hữu ích cho ứng dụng NestJS

```bash
# Xem pods trong môi trường dev
kubectl get pods -n nestjs-app-dev

# Xem pods trong môi trường production
kubectl get pods -n nestjs-app

# Xem logs của pod
kubectl logs -n nestjs-app <pod-name>

# Xem service và IP truy cập
kubectl get svc -n nestjs-app
```

### Endpoint API

| Tên          | URL                                            |
| ------------ | ---------------------------------------------- |
| API Root     | https://nestjs.157.230.194.205.nip.io/api      |
| Swagger Docs | https://nestjs.157.230.194.205.nip.io/api-docs |

### Truy cập HTTPS

Ứng dụng đã được cấu hình để tự động chuyển hướng từ HTTP sang HTTPS. Việc này được triển khai thông qua:

- Cert-manager để tự động lấy và quản lý chứng chỉ Let's Encrypt
- Nginx Ingress để điều hướng traffic và tự động chuyển hướng sang HTTPS
- Domain sử dụng service nip.io để trỏ đến IP máy chủ, không cần đăng ký domain riêng

## Cụm Kubernetes DigitalOcean

| Thông tin          | Giá trị                                    |
| ------------------ | ------------------------------------------ |
| Cluster            | do-sgp1-k8s-1-31-1-do-5-sgp1-1737474804586 |
| Kubernetes version | v1.31.1                                    |
| Nodes              | pool-1z8s8m1k5-e03na, pool-1z8s8m1k5-e03ne |

## GitHub

| Thông tin      | Giá trị                                    |
| -------------- | ------------------------------------------ |
| Repository     | https://github.com/ducdt1999/my-nestjs-app |
| Branch chính   | master                                     |
| Workflow CI/CD | .github/workflows/ci-cd.yml                |

### GitHub Secrets cần thiết

- `DOCKER_USERNAME`: Tên đăng nhập Docker Hub
- `DOCKER_PASSWORD`: Mật khẩu Docker Hub
- `GH_PAT`: GitHub Personal Access Token cho việc cập nhật file cấu hình
- `KUBE_CONFIG`: Cấu hình kubectl để đẩy code lên Kubernetes cluster

## Docker Hub

| Thông tin  | Giá trị                  |
| ---------- | ------------------------ |
| Repository | ducdt1999/nestjs-app     |
| Tags       | latest, v2, <commit-sha> |

Để xem tất cả các phiên bản image trên Docker Hub: https://hub.docker.com/r/ducdt1999/nestjs-app/tags
