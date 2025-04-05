# Triển Khai CI/CD cho Ứng Dụng NestJS với Argo CD

Tài liệu này hướng dẫn cách thiết lập quy trình CI/CD (Tích hợp liên tục/Triển khai liên tục) cho ứng dụng NestJS sử dụng Argo CD trên cụm Kubernetes DigitalOcean.

## Mục Lục

1. [Giới Thiệu về Argo CD](#giới-thiệu-về-argo-cd)
2. [Yêu Cầu Tiên Quyết](#yêu-cầu-tiên-quyết)
3. [Cài Đặt Argo CD](#cài-đặt-argo-cd)
4. [Thiết Lập Repository Git](#thiết-lập-repository-git)
5. [Tạo Quy Trình CI](#tạo-quy-trình-ci)
6. [Cấu Hình Argo CD](#cấu-hình-argo-cd)
7. [Triển Khai Tự Động](#triển-khai-tự-động)
8. [Kiểm Tra và Gỡ Lỗi](#kiểm-tra-và-gỡ-lỗi)

## Giới Thiệu về Argo CD

Argo CD là một công cụ GitOps cho Kubernetes, giúp triển khai tự động và đồng bộ hóa ứng dụng từ repository Git đến cụm Kubernetes. Nó theo dõi các thay đổi trong repository Git và tự động cập nhật ứng dụng trên Kubernetes khi phát hiện thay đổi.

**Lợi ích của Argo CD:**

- Quản lý ứng dụng theo phương pháp GitOps
- Tự động hóa triển khai
- Theo dõi trạng thái ứng dụng
- Rollback dễ dàng khi cần
- Giao diện người dùng trực quan

## Yêu Cầu Tiên Quyết

- Cụm Kubernetes DigitalOcean đang hoạt động
- Quyền truy cập vào cụm thông qua kubectl
- Ứng dụng NestJS đã được containerized (như trong hướng dẫn trước)
- Repository Git để lưu trữ mã nguồn và manifest Kubernetes
- Công cụ CI (như GitHub Actions, GitLab CI, hoặc Jenkins)

## Cài Đặt Argo CD

### 1. Tạo namespace cho Argo CD

```bash
kubectl create namespace argocd
```

### 2. Cài đặt Argo CD

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Đợi cho các pod Argo CD khởi động

```bash
kubectl get pods -n argocd
```

### 4. Truy cập UI của Argo CD

Có hai cách để truy cập giao diện người dùng của Argo CD:

#### Sử dụng Port Forwarding:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Sau đó truy cập: https://localhost:8080

#### Tạo LoadBalancer (khuyến nghị cho môi trường production):

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

Lấy địa chỉ IP từ LoadBalancer:

```bash
kubectl get svc argocd-server -n argocd
```

### 5. Lấy mật khẩu đăng nhập ban đầu

Tên người dùng mặc định là `admin`. Để lấy mật khẩu:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## Thiết Lập Repository Git

### 1. Tổ chức cấu trúc thư mục

Cấu trúc thư mục đề xuất:

```
my-nestjs-app/
├── src/                  # Mã nguồn NestJS
├── kubernetes/           # Manifest Kubernetes
│   ├── base/             # Cấu hình cơ bản
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   └── overlays/         # Cấu hình cho từng môi trường
│       ├── dev/
│       │   └── kustomization.yaml
│       └── prod/
│           └── kustomization.yaml
├── Dockerfile
└── Dockerfile.simple
```

### 2. Tạo file kustomization cho từng môi trường

**kubernetes/base/kustomization.yaml**:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

commonLabels:
  app: nestjs-app
```

**kubernetes/overlays/dev/kustomization.yaml**:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: nestjs-app-dev

patchesStrategicMerge:
  - deployment-patch.yaml

images:
  - name: ducdt1999/nestjs-app
    newTag: dev
```

**kubernetes/overlays/dev/deployment-patch.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: nestjs-app
          resources:
            limits:
              cpu: '100m'
              memory: '128Mi'
            requests:
              cpu: '50m'
              memory: '64Mi'
```

**kubernetes/overlays/prod/kustomization.yaml**:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: nestjs-app

patchesStrategicMerge:
  - deployment-patch.yaml

images:
  - name: ducdt1999/nestjs-app
    newTag: prod
```

**kubernetes/overlays/prod/deployment-patch.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: nestjs-app
          resources:
            limits:
              cpu: '200m'
              memory: '256Mi'
            requests:
              cpu: '100m'
              memory: '128Mi'
```

## Tạo Quy Trình CI

Chúng ta sẽ sử dụng GitHub Actions để tạo quy trình CI. Tạo file `.github/workflows/ci.yml`:

```yaml
name: NestJS CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build

  build-and-push-image:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.simple
          platforms: linux/amd64
          push: true
          tags: |
            ducdt1999/nestjs-app:latest
            ducdt1999/nestjs-app:${{ github.sha }}

      - name: Update Kubernetes manifest
        run: |
          cd kubernetes/overlays/prod
          sed -i "s/newTag:.*/newTag: ${{ github.sha }}/g" kustomization.yaml
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"
          git add .
          git commit -m "Update image tag to ${{ github.sha }}"
          git push
```

Lưu ý: Bạn cần thêm các secret `DOCKER_USERNAME` và `DOCKER_PASSWORD` trong repository GitHub của bạn.

## Cấu Hình Argo CD

### 1. Tạo ứng dụng trong Argo CD

Đăng nhập vào giao diện Argo CD và tạo ứng dụng mới với các thông tin sau:

- **Tên ứng dụng**: nestjs-app-prod
- **Project**: default
- **Sync Policy**: Automatic
- **Repository URL**: URL của GitHub repository của bạn
- **Path**: kubernetes/overlays/prod
- **Cluster**: https://kubernetes.default.svc (cụm hiện tại)
- **Namespace**: nestjs-app

Hoặc sử dụng CLI:

```bash
argocd app create nestjs-app-prod \
  --repo https://github.com/yourusername/my-nestjs-app.git \
  --path kubernetes/overlays/prod \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace nestjs-app \
  --sync-policy automated
```

### 2. Tạo tương tự cho môi trường dev

```bash
argocd app create nestjs-app-dev \
  --repo https://github.com/yourusername/my-nestjs-app.git \
  --path kubernetes/overlays/dev \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace nestjs-app-dev \
  --sync-policy automated
```

## Triển Khai Tự Động

Với cấu hình trên, quy trình CI/CD sẽ hoạt động như sau:

1. Developer push code lên nhánh main
2. GitHub Actions sẽ:
   - Build và test code
   - Build Docker image và push lên Docker Hub
   - Cập nhật tag image trong manifest Kubernetes
   - Commit và push thay đổi lên repository
3. Argo CD phát hiện thay đổi trong repository
4. Argo CD tự động cập nhật ứng dụng trong cụm Kubernetes

## Kiểm Tra và Gỡ Lỗi

### Kiểm tra trạng thái ứng dụng trong Argo CD

```bash
argocd app get nestjs-app-prod
```

### Xem nhật ký đồng bộ hóa

```bash
argocd app logs nestjs-app-prod
```

### Kiểm tra ứng dụng Kubernetes

```bash
kubectl get all -n nestjs-app
```

### Khắc phục sự cố thường gặp

1. **Ứng dụng không đồng bộ hóa**:

   - Kiểm tra quyền truy cập repository
   - Xác minh đường dẫn đến manifest Kubernetes
   - Kiểm tra lỗi trong manifest

2. **Image không được cập nhật**:

   - Kiểm tra lỗi trong quy trình CI/CD
   - Xác minh rằng image đã được push thành công

3. **Ứng dụng không khởi động**:
   - Kiểm tra nhật ký của pod
   - Xác minh cấu hình tài nguyên

## Kết Luận

Bằng cách sử dụng Argo CD, bạn đã thiết lập một quy trình CI/CD hoàn chỉnh cho ứng dụng NestJS của mình. Quy trình này tự động hóa việc kiểm tra, build, và triển khai ứng dụng mỗi khi có thay đổi trong mã nguồn.

Lợi ích chính của phương pháp GitOps này là:

- Tất cả các thay đổi đều được theo dõi trong Git
- Triển khai tự động và đáng tin cậy
- Khả năng rollback dễ dàng
- Tăng tốc độ phát triển và triển khai
