# Thông Tin Truy Cập Hệ Thống

File này tổng hợp tất cả các thông tin truy cập quan trọng cho hệ thống NestJS và các công cụ CI/CD.

## Thông tin truy cập API và dịch vụ

### Argo CD

- **URL:** https://146.190.4.238 hoặc https://[2400:6180:0:d2:0:1:bb07:8000]
- **URL Dự phòng:** https://localhost:8080 (qua port-forward)
- **Tài khoản:** admin
- **Mật khẩu:** EZx84T5ly-uMfeVb

### NestJS API

- **HTTP URL:** http://157.230.194.205
- **Tên miền mặc định:** http://nestjs.157.230.194.205.nip.io
- **Tên miền đề xuất:** http://nestjs.188.166.196.28.nip.io (trỏ đến Ingress Controller)
- **HTTPS URL khi chứng chỉ đã sẵn sàng:** https://nestjs.188.166.196.28.nip.io

### Lưu ý về HTTPS

Hiện tại, trạng thái chứng chỉ SSL vẫn đang chờ Let's Encrypt xác thực. Để tạm thời truy cập qua HTTPS, bạn có thể:

1. **Thêm vào file hosts:** Thêm dòng sau vào file `/etc/hosts` (Linux/macOS) hoặc `C:\Windows\System32\drivers\etc\hosts` (Windows):

   ```
   188.166.196.28 nestjs.188.166.196.28.nip.io
   ```

2. **Sử dụng curl với tùy chọn resolve:**
   ```
   curl -k --resolve nestjs.188.166.196.28.nip.io:443:188.166.196.28 https://nestjs.188.166.196.28.nip.io
   ```

### Lệnh hữu ích

```bash
# Kiểm tra trạng thái chứng chỉ
kubectl get certificate -n nestjs-app

# Xem chi tiết của Ingress
kubectl describe ingress -n nestjs-app

# Kiểm tra pod của ứng dụng
kubectl get pods -n nestjs-app

# Forward cổng nếu không thể truy cập trực tiếp
kubectl port-forward svc/nestjs-app 3000:80 -n nestjs-app
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
