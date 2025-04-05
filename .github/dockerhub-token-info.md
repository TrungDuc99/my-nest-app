# Hướng dẫn thiết lập Docker Hub Token

File này chỉ là hướng dẫn và **KHÔNG** chứa thông tin token thật.

## Cách tạo Docker Hub Access Token

1. Đăng nhập vào Docker Hub tại [hub.docker.com](https://hub.docker.com)
2. Truy cập Account Settings > Security
3. Tạo New Access Token với quyền Read & Write
4. Lưu token an toàn (bạn sẽ không thể xem lại token sau khi rời khỏi trang)

## Cách thiết lập GitHub Secrets

1. Truy cập GitHub repository > Settings > Secrets and variables > Actions
2. Tạo secret `DOCKERHUB_USERNAME` với tên người dùng Docker Hub
3. Tạo secret `DOCKERHUB_TOKEN` với access token đã tạo

**Lưu ý**: Không bao giờ lưu trữ token thật trong mã nguồn.
