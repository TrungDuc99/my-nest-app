<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# NestJS Application with Kubernetes and Argo CD

Ứng dụng NestJS được triển khai trên Kubernetes với CI/CD sử dụng GitHub Actions và Argo CD.

## Tổng Quan

Đây là một ứng dụng NestJS được containerized bằng Docker và triển khai trên cụm Kubernetes DigitalOcean sử dụng quy trình CI/CD tự động hoá.

### Công Nghệ Sử Dụng

- **Backend**: NestJS
- **Container**: Docker (với multi-stage builds)
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions + Argo CD
- **Registry**: Docker Hub

## Tài Liệu

Xem [Chỉ Mục Tài Liệu](./documentation-index.md) để truy cập tất cả các hướng dẫn và tài liệu có trong dự án.

### Truy Cập Nhanh

- [Thông Tin Truy Cập](./access-info.md) - Thông tin về URL, port, tài khoản, v.v.
- [Hướng Dẫn Triển Khai](./deployment-guide.md) - Hướng dẫn triển khai ứng dụng lên Kubernetes
- [Hướng Dẫn CI/CD](./cicd-argocd-guide.md) - Hướng dẫn thiết lập CI/CD với Argo CD
- [Hướng Dẫn Xử Lý Sự Cố](./troubleshooting-guide.md) - Hướng dẫn xử lý các vấn đề thường gặp
- [Hướng Dẫn Sử Dụng Kubectl](./kubectl-commands.md) - Tổng hợp các lệnh kubectl quản lý hệ thống

## Cấu Trúc Dự Án

```
my-nest-app/
├── src/                  # Mã nguồn NestJS
├── kubernetes/           # Manifest Kubernetes
│   ├── base/             # Cấu hình cơ bản
│   └── overlays/         # Cấu hình cho từng môi trường
│       ├── dev/
│       └── prod/
├── .github/workflows/    # CI/CD workflow
├── Dockerfile            # Dockerfile gốc
├── Dockerfile.simple     # Dockerfile đơn giản hóa
└── documentation/        # Tài liệu hướng dẫn
```

## Quy Trình CI/CD

1. Developer push code lên nhánh master
2. GitHub Actions tự động:
   - Build và test code
   - Build Docker image và push lên Docker Hub
   - Cập nhật tag image trong manifest Kubernetes
3. Argo CD phát hiện thay đổi trong manifest Kubernetes
4. Argo CD tự động triển khai phiên bản mới lên cụm Kubernetes

## Môi Trường

- **Development**: namespace `nestjs-app-dev`
- **Production**: namespace `nestjs-app`

## Lệnh Hữu Ích

Kiểm tra trạng thái ứng dụng:

```bash
kubectl get all -n nestjs-app
kubectl get all -n nestjs-app-dev
```

Xem logs của ứng dụng:

```bash
kubectl logs -f -n nestjs-app <pod-name>
```

Truy cập Argo CD UI:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Sau đó mở trình duyệt và truy cập https://localhost:8080

## Liên Hệ

Nếu có câu hỏi hoặc gặp vấn đề, vui lòng tạo issue hoặc liên hệ trực tiếp với team phát triển.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
