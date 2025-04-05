# Hướng dẫn thiết lập ArgoCD Secrets trong GitHub

File này chỉ là hướng dẫn và **KHÔNG** chứa thông tin xác thực thật.

## Secrets cần thiết

Để CI/CD pipeline có thể đăng nhập vào ArgoCD, bạn cần thiết lập các secrets sau trong GitHub repository:

1. **ARGOCD_SERVER**: URL của ArgoCD server (ví dụ: `146.190.4.238` hoặc `argocd.example.com`)
2. **ARGOCD_USERNAME**: Tên người dùng ArgoCD (thường là `admin`)
3. **ARGOCD_PASSWORD**: Mật khẩu ArgoCD

## Cách thiết lập GitHub Secrets

1. Truy cập GitHub repository > Settings > Secrets and variables > Actions
2. Nhấn "New repository secret" và thêm từng secret với thông tin tương ứng:
   - Name: `ARGOCD_SERVER`, Value: URL của ArgoCD server
   - Name: `ARGOCD_USERNAME`, Value: Tên người dùng ArgoCD
   - Name: `ARGOCD_PASSWORD`, Value: Mật khẩu ArgoCD

## Xác minh cấu hình

Sau khi thiết lập các secrets, CI/CD pipeline sẽ sử dụng chúng để đăng nhập vào ArgoCD. Bước "Debug Environment Variables" trong workflow sẽ hiển thị trạng thái của các secrets này (không hiển thị giá trị thực tế).

**Lưu ý**: Không bao giờ lưu trữ thông tin xác thực thật trong mã nguồn.
