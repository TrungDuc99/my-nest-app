# Hướng dẫn thiết lập ArgoCD Secrets trong GitHub

File này chỉ là hướng dẫn và **KHÔNG** chứa thông tin xác thực thật.

## Secrets cần thiết

Để CI/CD pipeline có thể đăng nhập vào ArgoCD, bạn cần thiết lập các secrets sau trong GitHub repository:

1. **ARGOCD_SERVER**:

   - Giá trị: **Chỉ** địa chỉ IP hoặc hostname của ArgoCD server (ví dụ: `146.190.4.238` hoặc `argocd.example.com`)
   - **QUAN TRỌNG**: KHÔNG bao gồm giao thức (http/https), dấu gạch chéo (`/`), hoặc cổng trong giá trị
   - ✅ Đúng: `146.190.4.238` hoặc `argocd.example.com`
   - ❌ Sai: `https://146.190.4.238`, `146.190.4.238/`, `//146.190.4.238`, `146.190.4.238:443`
   - Lưu ý: Workflow sẽ tự động thử các cổng 443 và 80

2. **ARGOCD_USERNAME**:

   - Giá trị: Tên người dùng ArgoCD (thường là `admin`)

3. **ARGOCD_PASSWORD**:
   - Giá trị: Mật khẩu ArgoCD

## Xử lý vấn đề "context deadline exceeded"

Nếu bạn gặp lỗi "context deadline exceeded", có thể do một số nguyên nhân sau:

1. **Cổng truy cập ArgoCD không phải 443 hoặc 80**: Workflow hiện tại thử kết nối qua cả cổng 443, 80 và không chỉ định cổng
2. **Firewall hoặc giới hạn mạng**: Đảm bảo rằng GitHub Actions runners (IP động) có thể truy cập đến ArgoCD server
3. **ArgoCD server không phản hồi**: Kiểm tra trạng thái của ArgoCD server và đảm bảo nó đang chạy
4. **ArgoCD URL Path sai**: Workflow thử với tham số `--grpc-web-root-path /` để hỗ trợ các cài đặt khác nhau

## Các lỗi phổ biến và cách khắc phục

- **"unknown flag: --timeout"**: Một số phiên bản ArgoCD CLI không hỗ trợ tham số --timeout. Đã cập nhật workflow để loại bỏ tham số này.
- **"dial tcp: lookup tcp"**: Lỗi này xảy ra khi có vấn đề với định dạng URL. Đã cập nhật xử lý URL để đảm bảo đúng định dạng.
- **"context deadline exceeded"**: Đã thêm nhiều phương thức kết nối thay thế để giải quyết vấn đề timeout.

## Cách thiết lập GitHub Secrets

1. Truy cập GitHub repository > Settings > Secrets and variables > Actions
2. Nhấn "New repository secret" và thêm từng secret với thông tin tương ứng:
   - Name: `ARGOCD_SERVER`, Value: Địa chỉ IP hoặc hostname (không có giao thức hoặc dấu gạch chéo)
   - Name: `ARGOCD_USERNAME`, Value: Tên người dùng ArgoCD
   - Name: `ARGOCD_PASSWORD`, Value: Mật khẩu ArgoCD

## Xác minh kết nối

Workflow đã được cập nhật để bao gồm bước kiểm tra kết nối đến ArgoCD server trên các cổng khác nhau trước khi cố gắng đăng nhập. Kết quả của các bước kiểm tra này sẽ giúp xác định nguyên nhân của vấn đề kết nối.

**Lưu ý**: Không bao giờ lưu trữ thông tin xác thực thật trong mã nguồn.
