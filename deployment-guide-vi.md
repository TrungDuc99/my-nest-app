# Hướng Dẫn Triển Khai NestJS lên DigitalOcean Kubernetes

Tài liệu này cung cấp hướng dẫn toàn diện về cách triển khai ứng dụng NestJS lên cụm Kubernetes của DigitalOcean, bao gồm các giải pháp cho các vấn đề phổ biến, giải thích về từng file và lệnh, cùng các phương pháp tốt nhất.

## Mục Lục

1. [Yêu Cầu Tiên Quyết](#yêu-cầu-tiên-quyết)
2. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
3. [Đóng Gói Ứng Dụng với Docker](#đóng-gói-ứng-dụng-với-docker)
4. [Các File Manifest của Kubernetes](#các-file-manifest-của-kubernetes)
5. [Quy Trình Triển Khai](#quy-trình-triển-khai)
6. [Xử Lý Sự Cố](#xử-lý-sự-cố)
7. [Các Lệnh Bảo Trì](#các-lệnh-bảo-trì)

## Yêu Cầu Tiên Quyết

- Docker được cài đặt localmà
- Công cụ dòng lệnh kubectl
- Truy cập vào cụm Kubernetes của DigitalOcean
- Tài khoản Docker Hub để lưu trữ các Docker image

## Cấu Trúc Dự Án

Dự án bao gồm một ứng dụng NestJS với các file quan trọng sau cho việc triển khai:

```
my-nest-app/
├── Dockerfile              # Dockerfile gốc
├── Dockerfile.simple       # Dockerfile đơn giản hóa
├── deployment.yaml         # File manifest Deployment của Kubernetes
├── service.yaml            # File manifest Service của Kubernetes
├── namespace.yaml          # File manifest Namespace của Kubernetes
├── resource-quota.yaml     # File manifest ResourceQuota của Kubernetes
└── kustomization.yaml      # File cấu hình Kustomize
```

## Đóng Gói Ứng Dụng với Docker

### Các Vấn Đề và Giải Pháp với Docker Builds

#### Vấn đề 1: Yêu cầu tương tác trong quá trình build

Ban đầu, quá trình cài đặt pnpm đã yêu cầu xác nhận từ người dùng, điều này khiến quá trình build Docker bị treo:

```
? The modules directory at "/app/node_modules" will be removed and reinstalled from scratch. Proceed? (Y/n)
```

**Giải pháp**: Chúng ta đã thử thêm flag `--yes` vào các lệnh pnpm nhưng phát hiện rằng pnpm không hỗ trợ flag này. Thay vào đó, chúng ta đã sử dụng các biến môi trường và flag `CI=true` để làm cho quá trình build không cần tương tác:

```dockerfile
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME
ENV CI=true
```

#### Vấn đề 2: Các vấn đề về không tương thích kiến trúc

Khi triển khai lên Kubernetes, chúng ta gặp phải lỗi "exec format error" do Docker image được build cho một kiến trúc khác với những gì được mong đợi trong cụm.

**Giải pháp**: Chúng ta đã chỉ định rõ ràng nền tảng trong Dockerfile và trong quá trình build:

```dockerfile
FROM --platform=linux/amd64 node:18-alpine AS build
```

Và lệnh build:

```bash
docker build --platform linux/amd64 -t ducdt1999/nestjs-app:v2 .
```

### Dockerfile.simple Cuối Cùng

```dockerfile
# Giai đoạn build
FROM --platform=linux/amd64 node:18-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Giai đoạn production
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/dist ./dist
RUN npm install -g pnpm && pnpm install --prod

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Dockerfile đơn giản này:

1. Sử dụng multi-stage build để giảm thiểu kích thước của image cuối cùng
2. Chỉ định rõ ràng nền tảng là linux/amd64
3. Tách biệt việc cài đặt dependencies khỏi việc sao chép mã để tận dụng bộ nhớ cache của Docker
4. Chỉ cài đặt các dependencies cho môi trường production trong image cuối cùng

## Các File Manifest của Kubernetes

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
  labels:
    app: nestjs-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nestjs-app
  template:
    metadata:
      labels:
        app: nestjs-app
    spec:
      containers:
        - name: nestjs-app
          image: ducdt1999/nestjs-app:v2
          ports:
            - containerPort: 3000
          resources:
            limits:
              cpu: '100m'
              memory: '128Mi'
            requests:
              cpu: '50m'
              memory: '64Mi'
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

**Mục đích**:

- Định nghĩa cách triển khai ứng dụng NestJS trong Kubernetes
- Chỉ định container image để sử dụng
- Thiết lập giới hạn và yêu cầu tài nguyên
- Cấu hình kiểm tra sức khỏe với các probe liveness và readiness

**Các thành phần chính**:

- `replicas: 1`: Số lượng bản sao pod (giảm từ 2 do hạn chế tài nguyên của cụm)
- `resources`: Giới hạn CPU và bộ nhớ/yêu cầu mà chúng ta phải giảm để phù hợp với khả năng của cụm
- `livenessProbe`: Kiểm tra xem ứng dụng có đang chạy không
- `readinessProbe`: Kiểm tra xem ứng dụng đã sẵn sàng phục vụ lưu lượng hay chưa

### service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nestjs-app
  labels:
    app: nestjs-app
spec:
  selector:
    app: nestjs-app
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
  type: LoadBalancer
```

**Mục đích**:

- Công khai ứng dụng NestJS ra internet
- Ánh xạ cổng 80 trên dịch vụ tới cổng 3000 trên container
- Sử dụng loại LoadBalancer để nhận IP bên ngoài từ DigitalOcean

### namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: nestjs-app
```

**Mục đích**:

- Tạo một namespace riêng biệt cho ứng dụng NestJS
- Giúp tổ chức và cô lập tài nguyên

### resource-quota.yaml

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: nestjs-app-quota
  namespace: nestjs-app
spec:
  hard:
    requests.cpu: '50m'
    requests.memory: '64Mi'
    limits.cpu: '100m'
    limits.memory: '128Mi'
```

**Mục đích**:

- Thiết lập giới hạn tài nguyên cho toàn bộ namespace
- Giúp ngăn chặn sự cạn kiệt tài nguyên trong cụm
- Phù hợp với yêu cầu tài nguyên của triển khai của chúng ta

### kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: nestjs-app

resources:
  - namespace.yaml
  - deployment.yaml
  - service.yaml
```

**Mục đích**:

- Tổ chức các tài nguyên Kubernetes để dễ dàng triển khai
- Đảm bảo namespace được tạo trước các tài nguyên khác
- Đơn giản hóa việc triển khai với một lệnh duy nhất

## Quy Trình Triển Khai

### 1. Build và Push Docker Image

```bash
# Build Docker image
docker build -f Dockerfile.simple -t ducdt1999/nestjs-app:v2 .

# Push image lên Docker Hub
docker push ducdt1999/nestjs-app:v2
```

### 2. Triển Khai lên Kubernetes

```bash
# Tạo namespace và áp dụng tất cả tài nguyên với kustomize
kubectl apply -k .

# Áp dụng các tài nguyên riêng lẻ (nếu cần)
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml -n nestjs-app
kubectl apply -f service.yaml -n nestjs-app
kubectl apply -f resource-quota.yaml
```

### 3. Xác Minh Việc Triển Khai

```bash
# Kiểm tra xem các pod có đang chạy không
kubectl get pods -n nestjs-app

# Kiểm tra xem dịch vụ có IP bên ngoài không
kubectl get service -n nestjs-app

# Kiểm tra ứng dụng
curl -I http://EXTERNAL_IP/
```

## Xử Lý Sự Cố

### Hạn Chế Tài Nguyên

**Vấn đề**: Các pod ở trạng thái Pending do không đủ tài nguyên CPU trên cụm.

```
Warning  FailedScheduling  0/2 nodes are available: 2 Insufficient cpu
```

**Giải pháp**:

1. Giảm yêu cầu tài nguyên trong deployment.yaml
2. Giảm số lượng bản sao từ 2 xuống 1
3. Tạo quota tài nguyên để đảm bảo chúng ta nằm trong giới hạn

```yaml
resources:
  limits:
    cpu: '100m'
    memory: '128Mi'
  requests:
    cpu: '50m'
    memory: '64Mi'
```

### Không Tương Thích Kiến Trúc

**Vấn đề**: Các pod đang gặp lỗi với "exec format error" do không tương thích về kiến trúc.

```
exec /usr/local/bin/docker-entrypoint.sh: exec format error
```

**Giải pháp**:

1. Tạo một Dockerfile đơn giản hóa (Dockerfile.simple)
2. Chỉ định rõ ràng nền tảng trong quá trình build
3. Sử dụng multi-stage build để tối ưu hóa image

```bash
docker build --platform linux/amd64 -t ducdt1999/nestjs-app:v2 .
```

### Xác Thực Docker Hub

**Vấn đề**: Không thể push image lên Docker Hub với lỗi "access denied".

**Giải pháp**:

1. Đảm bảo đăng nhập đúng cách với `docker login`
2. Sử dụng tên người dùng Docker Hub chính xác (ducdt1999)
3. Tạo image được gắn thẻ đúng cách

## Các Lệnh Bảo Trì

### Mở Rộng Ứng Dụng

```bash
# Mở rộng lên 3 bản sao
kubectl scale deployment nestjs-app -n nestjs-app --replicas=3
```

### Xem Nhật Ký Ứng Dụng

```bash
# Xem nhật ký
kubectl logs -f -n nestjs-app deployment/nestjs-app
```

### Cập Nhật Ứng Dụng

```bash
# Cập nhật image
kubectl set image deployment/nestjs-app -n nestjs-app nestjs-app=ducdt1999/nestjs-app:new-tag
```

### Xóa Triển Khai

```bash
# Xóa tất cả
kubectl delete -k .
```

## Kết Luận

Ứng dụng NestJS này đã được triển khai thành công lên DigitalOcean Kubernetes và có thể truy cập thông qua địa chỉ IP của LoadBalancer. Quá trình triển khai liên quan đến việc đóng gói ứng dụng với Docker, tạo các file manifest Kubernetes, và áp dụng chúng vào cụm.

Một số thách thức đã được gặp phải và giải quyết trong quá trình triển khai, bao gồm hạn chế tài nguyên, vấn đề tương thích kiến trúc, và các vấn đề xác thực Docker Hub. Giải pháp cuối cùng bao gồm một Docker image hợp lý và cấu hình Kubernetes được tối ưu hóa hoạt động trong các hạn chế của cụm DigitalOcean.
