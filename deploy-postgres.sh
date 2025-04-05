#!/bin/bash

# Tạo namespace nếu chưa tồn tại
kubectl create namespace nestjs-app-dev --dry-run=client -o yaml | kubectl apply -f -

# Áp dụng cấu hình Kubernetes
kubectl apply -k kubernetes/base -n nestjs-app-dev

# Chờ cho PostgreSQL khởi động (30 giây)
echo "Chờ cho PostgreSQL khởi động..."
sleep 30

# Kiểm tra status của các pods
kubectl get pods -n nestjs-app-dev

echo "Ứng dụng đã được triển khai với PostgreSQL"
echo "Bạn có thể truy cập API bằng lệnh: kubectl port-forward svc/nestjs-app 3000:80 -n nestjs-app-dev"