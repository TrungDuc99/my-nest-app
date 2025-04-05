# Hướng Dẫn Xử Lý Sự Cố

Tài liệu này cung cấp hướng dẫn xử lý các sự cố thường gặp khi triển khai và vận hành ứng dụng NestJS trên Kubernetes với Argo CD.

## Sự Cố Triển Khai Kubernetes

### 1. Pod ở trạng thái Pending

**Triệu chứng**: Pod ở trạng thái `Pending` và không được lên lịch trên bất kỳ node nào.

**Nguyên nhân có thể**:

- Không đủ tài nguyên CPU/Memory trên các node
- Node không đáp ứng các yêu cầu về affinity/taint

**Kiểm tra**:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

**Giải pháp**:

- Giảm yêu cầu tài nguyên trong manifest Deployment
- Thêm node vào cụm (nếu có thể)
- Kiểm tra cấu hình Resource Quota

### 2. Pod ở trạng thái CrashLoopBackOff

**Triệu chứng**: Pod liên tục khởi động lại và hiển thị trạng thái `CrashLoopBackOff`.

**Nguyên nhân có thể**:

- Lỗi trong ứng dụng
- Lỗi cấu hình
- Lỗi tài nguyên

**Kiểm tra**:

```bash
kubectl logs <pod-name> -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
```

**Giải pháp**:

- Sửa lỗi trong ứng dụng
- Kiểm tra cấu hình môi trường
- Tăng giới hạn tài nguyên nếu cần

### 3. Lỗi ImagePullBackOff

**Triệu chứng**: Pod không thể kéo image và hiển thị trạng thái `ImagePullBackOff`.

**Nguyên nhân có thể**:

- Image không tồn tại
- Không có quyền truy cập vào registry
- Sai tag của image

**Kiểm tra**:

```bash
kubectl describe pod <pod-name> -n <namespace>
```

**Giải pháp**:

- Kiểm tra và cập nhật tag image trong file kustomization
- Kiểm tra DockerHub để đảm bảo image tồn tại
- Thiết lập ImagePullSecret nếu cần

## Sự Cố Argo CD

### 1. Ứng dụng không đồng bộ (Unknown/OutOfSync)

**Triệu chứng**: Ứng dụng trong Argo CD hiển thị trạng thái `Unknown` hoặc `OutOfSync`.

**Nguyên nhân có thể**:

- Không thể truy cập repository Git
- Lỗi trong manifest Kubernetes
- Vấn đề với xác thực

**Kiểm tra**:

```bash
kubectl describe application <app-name> -n argocd
```

**Giải pháp**:

- Kiểm tra và cập nhật secret repository
- Kiểm tra cấu hình ứng dụng trong Argo CD
- Xác minh rằng branch và path trong cấu hình là chính xác

### 2. Lỗi "authentication required"

**Triệu chứng**: Argo CD không thể kéo từ repository và hiển thị lỗi "authentication required".

**Nguyên nhân có thể**:

- Thiếu hoặc không đúng secret authentication
- PAT (Personal Access Token) hết hạn
- URL repository không chính xác

**Kiểm tra**:

```bash
kubectl get secret repo-github-secret -n argocd -o yaml
```

**Giải pháp**:

- Cập nhật secret với thông tin xác thực chính xác
- Tạo PAT mới trên GitHub
- Kiểm tra và cập nhật URL repository

### 3. Argo CD UI không thể truy cập

**Triệu chứng**: Không thể truy cập UI Argo CD qua port-forward hoặc LoadBalancer.

**Nguyên nhân có thể**:

- Vấn đề với port-forward
- Vấn đề với LoadBalancer
- Sự cố với dịch vụ Argo CD

**Kiểm tra**:

```bash
kubectl get pods -n argocd
kubectl get svc argocd-server -n argocd
```

**Giải pháp**:

- Khởi động lại port-forward với cổng khác
- Kiểm tra trạng thái của LoadBalancer
- Khởi động lại các pod Argo CD nếu cần

## Sự Cố CI/CD

### 1. GitHub Actions workflow thất bại

**Triệu chứng**: Workflow CI/CD trong GitHub Actions thất bại.

**Nguyên nhân có thể**:

- Lỗi trong tests
- Vấn đề với build
- Thiếu secrets

**Kiểm tra**:

- Xem logs của workflow trong GitHub Actions

**Giải pháp**:

- Sửa lỗi trong code
- Kiểm tra cấu hình build
- Thêm hoặc cập nhật secrets trong repository GitHub

### 2. Docker image không được cập nhật

**Triệu chứng**: Phiên bản mới của ứng dụng không được triển khai mặc dù workflow CI hoàn thành thành công.

**Nguyên nhân có thể**:

- Vấn đề với việc push image lên DockerHub
- Kustomization file không được cập nhật
- Argo CD không phát hiện thay đổi

**Kiểm tra**:

```bash
kubectl get application <app-name> -n argocd -o yaml
```

**Giải pháp**:

- Kiểm tra logs workflow CI/CD trong GitHub
- Cập nhật thủ công tag image trong file kustomization
- Thực hiện đồng bộ hóa thủ công trong Argo CD

## Các Lỗi Khác

### 1. Lỗi "exec format error"

**Triệu chứng**: Pod khởi động nhưng gặp lỗi "exec format error".

**Nguyên nhân có thể**:

- Không tương thích về kiến trúc (e.g., ARM vs x86)
- Lỗi trong Dockerfile

**Giải pháp**:

- Sử dụng flag `--platform=linux/amd64` trong Dockerfile
- Build image cho kiến trúc cụ thể của cụm Kubernetes

### 2. Vấn đề hiệu suất ứng dụng

**Triệu chứng**: Ứng dụng chạy chậm hoặc không ổn định.

**Nguyên nhân có thể**:

- Giới hạn tài nguyên quá thấp
- Quá nhiều requests
- Vấn đề với database hoặc dịch vụ bên ngoài

**Kiểm tra**:

```bash
kubectl top pods -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

**Giải pháp**:

- Tăng giới hạn tài nguyên
- Thêm HorizontalPodAutoscaler
- Tối ưu hóa code hoặc cấu hình

## Liên Hệ Hỗ Trợ

Nếu bạn gặp sự cố không được đề cập trong tài liệu này, vui lòng liên hệ:

- Tạo issue trên GitHub repository
- Liên hệ team DevOps qua email: devops@company.com
- Báo cáo sự cố trong hệ thống ticket nội bộ
