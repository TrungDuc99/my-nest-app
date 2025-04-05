# Hướng dẫn thiết lập Private Repository và kết nối với Argo CD

## 1. Tạo Private Repository trên GitHub

1. Đăng nhập vào GitHub
2. Nhấn vào biểu tượng "+" ở góc trên bên phải và chọn "New repository"
3. Điền thông tin repository:
   - Repository name: `my-nest-app`
   - Description: Task Management API with NestJS
   - Chọn "Private"
4. Nhấn "Create repository"

## 2. Kết nối local repository với GitHub

```bash
# Đảm bảo bạn đang ở thư mục gốc của dự án
git remote add origin https://github.com/YourUsername/my-nest-app.git

# Đẩy code lên GitHub (branch main)
git push -u origin main

# Đẩy các branch khác
git checkout development
git push -u origin development

git checkout production
git push -u origin production
```

## 3. Tạo Personal Access Token (PAT) cho Argo CD

1. Đăng nhập vào GitHub
2. Vào Settings > Developer settings > Personal access tokens > Tokens (classic)
3. Chọn "Generate new token" > "Generate new token (classic)"
4. Đặt tên cho token: "ArgoCD Access"
5. Chọn các quyền:
   - repo (tất cả)
   - read:packages
6. Nhấn "Generate token"
7. Sao chép token (chỉ hiển thị một lần)

## 4. Cấu hình Kubernetes Secret để Argo CD truy cập Private Repository

```bash
# Tạo Kubernetes Secret cho GitHub credentials
kubectl create secret generic github-repo -n argocd \
  --from-literal=username=YourUsername \
  --from-literal=password=YourPersonalAccessToken

# Cấu hình Argo CD để sử dụng secret này
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: github-repo-creds
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/YourUsername/my-nest-app.git
  username: YourUsername
  password: YourPersonalAccessToken
EOF
```

## 5. Cập nhật các file Argo CD Application với URL của private repository

1. Cập nhật `argocd-app-dev.yaml`:

```yaml
spec:
  source:
    repoURL: https://github.com/YourUsername/my-nest-app.git
```

2. Cập nhật `argocd-app-prod.yaml`:

```yaml
spec:
  source:
    repoURL: https://github.com/YourUsername/my-nest-app.git
```

3. Áp dụng cấu hình:

```bash
kubectl apply -f argocd-app-dev.yaml
kubectl apply -f argocd-app-prod.yaml
```

## 6. Thiết lập GitHub Secrets cho GitHub Actions

Để GitHub Actions có thể triển khai ứng dụng, bạn cần thiết lập các secrets:

1. Trong GitHub repo, vào Settings > Secrets and variables > Actions
2. Thêm các secrets sau:
   - `DOCKERHUB_USERNAME`: Tên người dùng DockerHub
   - `DOCKERHUB_TOKEN`: Token truy cập DockerHub
   - `ARGOCD_SERVER`: URL của Argo CD server (ví dụ: 146.190.4.238)
   - `ARGOCD_USERNAME`: Tên đăng nhập Argo CD (thường là admin)
   - `ARGOCD_PASSWORD`: Mật khẩu Argo CD

## 7. Quy trình làm việc

1. Development flow:

   - Phát triển trên branch feature/fix
   - Tạo PR vào branch `development`
   - Sau khi merge, GitHub Actions sẽ tự động build và triển khai vào môi trường dev

2. Production flow:
   - Tạo PR từ branch `development` vào branch `production`
   - Review và approve PR
   - Sau khi merge, GitHub Actions sẽ tự động build và triển khai vào môi trường production
