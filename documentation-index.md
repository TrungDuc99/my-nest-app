# Chỉ Mục Tài Liệu

File này tổng hợp tất cả các tài liệu hướng dẫn có trong dự án.

## Thông Tin Truy Cập

- [Thông Tin Truy Cập](./access-info.md) - Tổng hợp thông tin đăng nhập, URL, port và các thông tin truy cập quan trọng khác.

## Hướng Dẫn Triển Khai (Deployment)

- [Hướng Dẫn Triển Khai (English)](./deployment-guide.md) - Hướng dẫn chi tiết cách triển khai ứng dụng NestJS lên DigitalOcean Kubernetes.
- [Hướng Dẫn Triển Khai (Tiếng Việt)](./deployment-guide-vi.md) - Bản tiếng Việt của hướng dẫn triển khai.

## Hướng Dẫn CI/CD

- [Hướng Dẫn CI/CD với Argo CD](./cicd-argocd-guide.md) - Hướng dẫn thiết lập CI/CD cho ứng dụng NestJS sử dụng Argo CD.

## Hướng Dẫn Xử Lý Sự Cố

- [Hướng Dẫn Xử Lý Sự Cố](./troubleshooting-guide.md) - Hướng dẫn xử lý các vấn đề thường gặp khi triển khai và vận hành hệ thống.
  - Sự cố triển khai Kubernetes
  - Sự cố Argo CD
  - Sự cố CI/CD
  - Các lỗi thường gặp khác

## Hướng Dẫn Quản Lý Hệ Thống

- [Hướng Dẫn Sử Dụng Kubectl](./kubectl-commands.md) - Tổng hợp các lệnh kubectl thường dùng để quản lý và debug ứng dụng trên Kubernetes.
  - Lệnh cơ bản
  - Kiểm tra ứng dụng
  - Xem logs và truy cập pod
  - Port-forward và truy cập ứng dụng
  - Quản lý Argo CD
  - Lệnh nâng cao và mẹo sử dụng

## Cấu Trúc Dự Án

### File Cấu Hình Docker

- `Dockerfile` - Dockerfile gốc
- `Dockerfile.simple` - Dockerfile đơn giản hóa sử dụng cho CI/CD

### File Cấu Hình Kubernetes

**Base**:

- `kubernetes/base/deployment.yaml` - Cấu hình Deployment cơ bản
- `kubernetes/base/service.yaml` - Cấu hình Service cơ bản
- `kubernetes/base/kustomization.yaml` - File Kustomize cơ bản

**Môi Trường Dev**:

- `kubernetes/overlays/dev/deployment-patch.yaml` - Patch cho Deployment trong môi trường dev
- `kubernetes/overlays/dev/kustomization.yaml` - Cấu hình Kustomize cho môi trường dev

**Môi Trường Production**:

- `kubernetes/overlays/prod/deployment-patch.yaml` - Patch cho Deployment trong môi trường production
- `kubernetes/overlays/prod/kustomization.yaml` - Cấu hình Kustomize cho môi trường production

### File Cấu Hình Argo CD

- `argocd-app-dev.yaml` - Định nghĩa ứng dụng Argo CD cho môi trường dev
- `argocd-app-prod.yaml` - Định nghĩa ứng dụng Argo CD cho môi trường production
- `repo-secret.yaml` - Secret để Argo CD có thể truy cập vào GitHub repository

### File Cấu Hình CI/CD

- `.github/workflows/ci-cd.yml` - Workflow GitHub Actions cho CI/CD

## Quy Trình Dev-to-Production

1. Developer push code lên nhánh master
2. GitHub Actions workflow được kích hoạt:
   - Build và test code
   - Build Docker image và push lên Docker Hub với tag là commit SHA
   - Tự động cập nhật tag image trong file cấu hình Kubernetes
3. Argo CD phát hiện thay đổi trong repository
4. Argo CD tự động triển khai phiên bản mới vào môi trường Kubernetes

## Kiểm Tra và Gỡ Lỗi

Xem file [Thông Tin Truy Cập](./access-info.md) để biết các lệnh hữu ích cho việc kiểm tra và gỡ lỗi.

Nếu gặp sự cố, tham khảo [Hướng Dẫn Xử Lý Sự Cố](./troubleshooting-guide.md) để tìm giải pháp.
