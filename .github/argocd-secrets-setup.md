# Hướng dẫn thiết lập ArgoCD Secrets trong GitHub

File này chỉ là hướng dẫn và **KHÔNG** chứa thông tin xác thực thật.

## Secrets cần thiết

Để CI/CD pipeline có thể đăng nhập vào ArgoCD, bạn cần thiết lập các secrets sau trong GitHub repository:

1. **ARGOCD_SERVER**:

   - Giá trị: **Chỉ** địa chỉ IP hoặc hostname của ArgoCD server (ví dụ: `146.190.4.238` hoặc `argocd.example.com`)
   - **QUAN TRỌNG**: KHÔNG bao gồm giao thức (http/https), dấu gạch chéo (`/`), hoặc cổng trong giá trị
   - ✅ Đúng: `146.190.4.238` hoặc `argocd.example.com`
   - ❌ Sai: `https://146.190.4.238`, `146.190.4.238/`, `//146.190.4.238`, `146.190.4.238:443`
   - Lưu ý: Workflow sẽ tự động thử nhiều cổng khác nhau (443, 80, 8080, 8443)

2. **ARGOCD_USERNAME**:

   - Giá trị: Tên người dùng ArgoCD (thường là `admin`)

3. **ARGOCD_PASSWORD**:
   - Giá trị: Mật khẩu ArgoCD

## Cổng và Giao thức ArgoCD

ArgoCD có thể được thiết lập để lắng nghe trên các cổng khác nhau. Workflow đã được cập nhật để thử các cấu hình phổ biến:

1. **HTTPS (port 443)** - Cấu hình tiêu chuẩn với TLS
2. **HTTP (port 80)** - Cấu hình không bảo mật (thường được redirect đến HTTPS)
3. **HTTP/HTTPS (port 8080/8443)** - Cổng phổ biến cho Kubernetes services
4. **Không chỉ định cổng** - Để ArgoCD CLI tự động phát hiện

## Xử lý vấn đề "context deadline exceeded"

Nếu bạn gặp lỗi "context deadline exceeded", workflow mới sẽ:

1. **Tăng timeout** cho các kết nối kiểm tra (20 giây thay vì 10 giây)
2. **Thử cờ --plaintext** để sử dụng kết nối không mã hóa (giải quyết vấn đề TLS)
3. **Kiểm tra nhiều cổng** (443, 80, 8080, 8443) để tìm cổng ArgoCD đang lắng nghe
4. **Thực hiện kiểm tra mạng** (ping, traceroute, nslookup) để xác định vấn đề kết nối
5. **Hiển thị thông tin chẩn đoán** chi tiết để giúp gỡ lỗi

## Các lỗi phổ biến và cách khắc phục

- **"unknown flag: --timeout"**: Đã loại bỏ cờ --timeout không được hỗ trợ
- **"dial tcp: lookup tcp"**: Lỗi định dạng URL, đã cải thiện xử lý URL
- **"context deadline exceeded"**: Đã thêm các phương thức kết nối thay thế và kiểm tra mạng chi tiết
- **Không thể kết nối đến server**: Kiểm tra firewall và các quy tắc mạng để đảm bảo GitHub Actions runners có thể truy cập server

## Tùy chọn kết nối nâng cao

Workflow hiện tại thử nhiều tùy chọn kết nối khác nhau:

- `--insecure`: Bỏ qua xác thực chứng chỉ TLS
- `--plaintext`: Sử dụng kết nối không mã hóa thay vì TLS
- Kết hợp các cổng và giao thức khác nhau

## Cách thiết lập GitHub Secrets

1. Truy cập GitHub repository > Settings > Secrets and variables > Actions
2. Nhấn "New repository secret" và thêm từng secret với thông tin tương ứng:
   - Name: `ARGOCD_SERVER`, Value: Địa chỉ IP hoặc hostname (không có giao thức hoặc dấu gạch chéo)
   - Name: `ARGOCD_USERNAME`, Value: Tên người dùng ArgoCD
   - Name: `ARGOCD_PASSWORD`, Value: Mật khẩu ArgoCD

## Kiểm tra kết nối

Workflow bao gồm các bước kiểm tra kết nối chi tiết:

- Kiểm tra cổng (netcat)
- Kiểm tra API endpoints (curl)
- Kiểm tra mạng cơ bản (ping, traceroute, nslookup)

Kết quả của các bước này sẽ giúp xác định chính xác vấn đề kết nối và đưa ra giải pháp phù hợp.

**Lưu ý**: Không bao giờ lưu trữ thông tin xác thực thật trong mã nguồn.
