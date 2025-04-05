# NestJS Deployment Guide to DigitalOcean Kubernetes

This document provides a comprehensive guide on how to deploy a NestJS application to a DigitalOcean Kubernetes cluster, including solutions to common issues, explanation of each file and command, and best practices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Dockerizing the Application](#dockerizing-the-application)
4. [Kubernetes Manifest Files](#kubernetes-manifest-files)
5. [Deployment Process](#deployment-process)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance Commands](#maintenance-commands)

## Prerequisites

- Docker installed locally
- kubectl command-line tool
- Access to a DigitalOcean Kubernetes cluster
- Docker Hub account for storing Docker images

## Project Structure

The project consists of a NestJS application with the following important files for deployment:

```
my-nest-app/
├── Dockerfile              # Original Dockerfile
├── Dockerfile.simple       # Simplified Dockerfile
├── deployment.yaml         # Kubernetes Deployment manifest
├── service.yaml            # Kubernetes Service manifest
├── namespace.yaml          # Kubernetes Namespace manifest
├── resource-quota.yaml     # Kubernetes ResourceQuota manifest
└── kustomization.yaml      # Kustomize configuration file
```

## Dockerizing the Application

### Issues and Solutions with Docker Builds

#### Problem 1: Interactive prompts during build

Initially, the pnpm installation was prompting for user confirmation which caused the Docker build to hang:

```
? The modules directory at "/app/node_modules" will be removed and reinstalled from scratch. Proceed? (Y/n)
```

**Solution**: We tried adding `--yes` flag to pnpm commands but discovered that pnpm doesn't support this flag. Instead, we used environment variables and the `CI=true` flag to make the build non-interactive:

```dockerfile
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PATH:$PNPM_HOME
ENV CI=true
```

#### Problem 2: Architecture mismatch issues

When deploying to Kubernetes, we encountered "exec format error" issues because the Docker image was built for a different architecture than what was expected in the cluster.

**Solution**: We explicitly specified the platform in our Dockerfile and during the build process:

```dockerfile
FROM --platform=linux/amd64 node:18-alpine AS build
```

And the build command:

```bash
docker build --platform linux/amd64 -t ducdt1999/nestjs-app:v2 .
```

### Final Dockerfile.simple

```dockerfile
# Build stage
FROM --platform=linux/amd64 node:18-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Production stage
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/dist ./dist
RUN npm install -g pnpm && pnpm install --prod

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

This simplified Dockerfile:

1. Uses a multi-stage build to minimize the final image size
2. Explicitly specifies the platform as linux/amd64
3. Separates dependency installation from code copying to leverage Docker caching
4. Only installs production dependencies in the final image

## Kubernetes Manifest Files

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

**Purpose**:

- Defines how to deploy the NestJS application in Kubernetes
- Specifies the container image to use
- Sets resource limits and requests
- Configures health checks with liveness and readiness probes

**Key components**:

- `replicas: 1`: Number of pod replicas (reduced from 2 due to cluster resource constraints)
- `resources`: CPU and memory limits/requests that we had to reduce to match cluster capacity
- `livenessProbe`: Checks if the application is running
- `readinessProbe`: Checks if the application is ready to serve traffic

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

**Purpose**:

- Exposes the NestJS application to the internet
- Maps port 80 on the service to port 3000 on the container
- Uses LoadBalancer type to get an external IP from DigitalOcean

### namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: nestjs-app
```

**Purpose**:

- Creates a dedicated namespace for the NestJS application
- Helps with organization and resource isolation

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

**Purpose**:

- Sets resource limits for the entire namespace
- Helps prevent resource exhaustion in the cluster
- Matches the resource requirements of our deployment

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

**Purpose**:

- Organizes Kubernetes resources for easier deployment
- Ensures the namespace is created before other resources
- Simplifies deployment with a single command

## Deployment Process

### 1. Building and Pushing the Docker Image

```bash
# Build the Docker image
docker build -f Dockerfile.simple -t ducdt1999/nestjs-app:v2 .

# Push the image to Docker Hub
docker push ducdt1999/nestjs-app:v2
```

### 2. Deploying to Kubernetes

```bash
# Create the namespace and apply all resources with kustomize
kubectl apply -k .

# Apply individual resources (if needed)
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml -n nestjs-app
kubectl apply -f service.yaml -n nestjs-app
kubectl apply -f resource-quota.yaml
```

### 3. Verifying the Deployment

```bash
# Check if pods are running
kubectl get pods -n nestjs-app

# Check if the service has an external IP
kubectl get service -n nestjs-app

# Test the application
curl -I http://EXTERNAL_IP/
```

## Troubleshooting

### Resource Constraints

**Issue**: Pods were in Pending state due to insufficient CPU resources on the cluster.

```
Warning  FailedScheduling  0/2 nodes are available: 2 Insufficient cpu
```

**Solution**:

1. Reduced resource requirements in deployment.yaml
2. Reduced the number of replicas from 2 to 1
3. Created resource quotas to ensure we stay within limits

```yaml
resources:
  limits:
    cpu: '100m'
    memory: '128Mi'
  requests:
    cpu: '50m'
    memory: '64Mi'
```

### Architecture Mismatch

**Issue**: Pods were failing with "exec format error" due to architecture incompatibility.

```
exec /usr/local/bin/docker-entrypoint.sh: exec format error
```

**Solution**:

1. Created a simplified Dockerfile (Dockerfile.simple)
2. Explicitly specified the platform during build
3. Used multi-stage builds to optimize the image

```bash
docker build --platform linux/amd64 -t ducdt1999/nestjs-app:v2 .
```

### Docker Hub Authentication

**Issue**: Could not push images to Docker Hub with "access denied" errors.

**Solution**:

1. Ensured proper login with `docker login`
2. Used the correct Docker Hub username (ducdt1999)
3. Created properly tagged images

## Maintenance Commands

### Scaling the Application

```bash
# Scale to 3 replicas
kubectl scale deployment nestjs-app -n nestjs-app --replicas=3
```

### Viewing Application Logs

```bash
# View logs
kubectl logs -f -n nestjs-app deployment/nestjs-app
```

### Updating the Application

```bash
# Update the image
kubectl set image deployment/nestjs-app -n nestjs-app nestjs-app=ducdt1999/nestjs-app:new-tag
```

### Deleting the Deployment

```bash
# Delete everything
kubectl delete -k .
```

## Conclusion

This NestJS application is now successfully deployed to DigitalOcean Kubernetes and accessible via the LoadBalancer IP address. The deployment process involved containerizing the application with Docker, creating Kubernetes manifest files, and applying them to the cluster.

Several challenges were encountered and resolved during the deployment process, including resource constraints, architecture compatibility issues, and Docker Hub authentication problems. The final solution involves a streamlined Docker image and optimized Kubernetes configuration that works within the constraints of the DigitalOcean cluster.
