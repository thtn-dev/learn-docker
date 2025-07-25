# Dockerfile 101: Hướng dẫn từ cơ bản đến nâng cao

## Mục lục
1. [Giới thiệu và khái niệm cơ bản](#giới-thiệu-và-khái-niệm-cơ-bản)
2. [Cấu trúc và syntax của Dockerfile](#cấu-trúc-và-syntax-của-dockerfile)
3. [Các instruction cơ bản](#các-instruction-cơ-bản)
4. [Layers và Docker Cache](#layers-và-docker-cache)
5. [Best Practices cơ bản](#best-practices-cơ-bản)
6. [Các instruction nâng cao](#các-instruction-nâng-cao)
7. [Multi-stage builds](#multi-stage-builds)
8. [Security trong Dockerfile](#security-trong-dockerfile)
9. [Optimization và Performance](#optimization-và-performance)
10. [Troubleshooting và Debug](#troubleshooting-và-debug)
11. [Examples thực tế](#examples-thực-tế)

---

## Giới thiệu và khái niệm cơ bản

### Dockerfile là gì?

Dockerfile là một file text đơn giản chứa một chuỗi các instruction (lệnh) mà Docker engine sẽ đọc và thực thi để tạo ra một Docker image. Bạn có thể hiểu Dockerfile như một "công thức nấu ăn" - nó mô tả từng bước cần thiết để tạo ra một môi trường ứng dụng hoàn chỉnh.

Hãy tưởng tượng bạn muốn chuẩn bị một căn phòng cho khách. Dockerfile sẽ mô tả từng bước: chọn loại phòng (base image), sắp xếp đồ đạc (copy files), cài đặt tiện nghi (install packages), và cuối cùng là cách khách sẽ sử dụng phòng (run application).

### Tại sao cần Dockerfile?

Dockerfile giải quyết bài toán "It works on my machine" bằng cách:
- **Tái tạo môi trường nhất quán**: Mọi người đều có cùng một môi trường runtime
- **Tự động hóa việc setup**: Không cần cài đặt thủ công nhiều lần
- **Version control**: Dockerfile có thể được quản lý bằng Git như code
- **Scalability**: Dễ dàng deploy trên nhiều server khác nhau

### Quy trình hoạt động

```
Dockerfile → docker build → Docker Image → docker run → Container
```

Dockerfile được build thành image, image được run thành container. Container là nơi ứng dụng của bạn thực sự chạy.

---

## Cấu trúc và syntax của Dockerfile

### Quy tắc cơ bản

Dockerfile tuân theo các quy tắc syntax đơn giản:
- Mỗi instruction nằm trên một dòng riêng biệt
- Instruction không phân biệt hoa thường, nhưng convention là viết HOA
- Dòng đầu tiên phải là FROM (trừ khi có ARG trước FROM)
- Comments bắt đầu bằng ký tự `#`

### Cấu trúc cơ bản

```dockerfile
# Comment: Đây là comment
FROM base_image:tag

# Metadata
LABEL maintainer="your-email@example.com"

# Environment setup
ENV NODE_ENV=production

# Working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Define how to run the application
CMD ["npm", "start"]
```

### Docker Context

Khi bạn chạy `docker build .`, dấu chấm `.` đại diện cho build context. Docker sẽ gửi toàn bộ thư mục hiện tại đến Docker daemon. Điều này có nghĩa:
- Mọi file trong thư mục có thể được COPY vào image
- Thư mục càng lớn, build càng chậm
- Sử dụng `.dockerignore` để loại trừ file không cần thiết

---

## Các instruction cơ bản

### FROM - Chọn base image

FROM là instruction bắt buộc đầu tiên, định nghĩa image gốc mà container của bạn sẽ được xây dựng dựa trên đó.

```dockerfile
# Sử dụng image chính thức của Node.js
FROM node:18

# Sử dụng image với tag cụ thể để đảm bảo tính nhất quán
FROM node:18.17.0-alpine

# Sử dụng image từ registry khác
FROM registry.company.com/base-image:latest
```

**Lưu ý quan trọng**: Luôn sử dụng tag cụ thể thay vì `latest` trong production để tránh breaking changes không mong muốn.

### WORKDIR - Thiết lập thư mục làm việc

WORKDIR thiết lập thư mục làm việc cho các instruction tiếp theo. Nó tương tự như lệnh `cd` trong terminal.

```dockerfile
# Tạo và chuyển đến thư mục /app
WORKDIR /app

# Các instruction tiếp theo sẽ được thực thi trong /app
COPY package.json .
RUN npm install
```

**Tại sao cần WORKDIR?**
- Tránh làm việc trong thư mục root (/) gây bừa bộn
- Tạo structure rõ ràng cho ứng dụng
- Các relative paths sẽ được tính từ WORKDIR

### COPY vs ADD - Sao chép files

Cả hai instruction đều copy files từ host vào container, nhưng có sự khác biệt:

```dockerfile
# COPY: Đơn giản, chỉ copy files/folders
COPY package.json /app/
COPY src/ /app/src/
COPY . .  # Copy tất cả từ build context

# ADD: Có thêm tính năng đặc biệt
ADD archive.tar.gz /app/  # Tự động extract
ADD https://example.com/file.txt /app/  # Download từ URL
```

**Best practice**: Sử dụng COPY trừ khi bạn thực sự cần tính năng đặc biệt của ADD.

### RUN - Thực thi commands

RUN thực thi commands trong container và tạo ra layer mới.

```dockerfile
# Shell form: Chạy trong shell (/bin/sh -c)
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    git

# Exec form: Chạy trực tiếp binary
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "curl"]
```

**Kỹ thuật tối ưu hóa**: Kết hợp nhiều commands trong một RUN để giảm số layers:

```dockerfile
# Không tốt: Tạo 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# Tốt: Chỉ tạo 1 layer
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### ENV - Environment variables

ENV thiết lập biến môi trường sẽ tồn tại trong container khi chạy.

```dockerfile
# Syntax cơ bản
ENV NODE_ENV=production
ENV PORT=3000

# Có thể thiết lập nhiều biến cùng lúc
ENV NODE_ENV=production \
    PORT=3000 \
    DEBUG=false

# Sử dụng biến trong các instruction khác
ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY . $APP_HOME
```

### EXPOSE - Khai báo ports

EXPOSE khai báo port mà container sẽ lắng nghe. Lưu ý: đây chỉ là documentation, không thực sự publish port.

```dockerfile
# Khai báo port 3000
EXPOSE 3000

# Khai báo nhiều ports
EXPOSE 3000 8080

# Khai báo port với protocol
EXPOSE 3000/tcp
EXPOSE 53/udp
```

### CMD vs ENTRYPOINT - Định nghĩa cách chạy container

Đây là hai instruction quan trọng nhất để hiểu cách container sẽ được khởi động.

**CMD**: Định nghĩa command mặc định, có thể bị override khi run container.

```dockerfile
# Shell form
CMD echo "Hello World"

# Exec form (preferred)
CMD ["echo", "Hello World"]

# Để chạy ứng dụng Node.js
CMD ["node", "server.js"]
```

**ENTRYPOINT**: Định nghĩa command cố định, không thể override.

```dockerfile
# Luôn chạy node
ENTRYPOINT ["node"]

# Kết hợp với CMD để có default argument
ENTRYPOINT ["node"]
CMD ["server.js"]
```

**Khi nào sử dụng cái gì?**
- Sử dụng CMD khi bạn muốn user có thể thay đổi command
- Sử dụng ENTRYPOINT khi bạn muốn container luôn chạy một binary cụ thể
- Kết hợp cả hai để có flexibility và default values

---

## Layers và Docker Cache

### Hiểu về Docker Layers

Mỗi instruction trong Dockerfile tạo ra một layer. Các layers này được stack lên nhau để tạo thành image cuối cùng. Điều này giống như việc xây một tòa nhà - mỗi tầng được xây dựa dựa trên tầng dưới.

```dockerfile
FROM node:18           # Layer 1: Base image
WORKDIR /app          # Layer 2: Create working directory
COPY package.json .   # Layer 3: Copy package.json
RUN npm install       # Layer 4: Install dependencies
COPY . .              # Layer 5: Copy source code
CMD ["npm", "start"]  # Layer 6: Set default command
```

### Docker Build Cache

Docker sử dụng cache để tăng tốc quá trình build. Nếu Docker phát hiện một layer chưa thay đổi, nó sẽ sử dụng lại layer đã cached thay vì build lại.

**Cache invalidation**: Khi một layer thay đổi, tất cả layers sau đó sẽ bị rebuild.

```dockerfile
# Tốt: Dependencies ít thay đổi, để trước
COPY package.json .
RUN npm install

# Source code thay đổi thường xuyên, để sau
COPY . .

# Không tốt: Mỗi lần thay đổi source code phải install lại
COPY . .
RUN npm install
```

### Tối ưu hóa Cache Strategy

```dockerfile
# Strategy 1: Separate dependency installation
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Strategy 2: Multi-stage để tách build và runtime
FROM node:18 AS builder
# ... build steps

FROM node:18-alpine AS runtime
# ... only copy built artifacts
```

---

## Best Practices cơ bản

### 1. Sử dụng official images làm base

```dockerfile
# Tốt: Official image, maintained tốt
FROM node:18-alpine

# Tránh: Image không rõ nguồn gốc
FROM some-random-user/nodejs
```

### 2. Minimize layer count

```dockerfile
# Không tốt: Nhiều layers không cần thiết
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim
RUN apt-get clean

# Tốt: Kết hợp thành một layer
RUN apt-get update && \
    apt-get install -y curl vim && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Leverage build cache

```dockerfile
# Tốt: Copy dependencies trước, source code sau
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Không tốt: Copy all rồi install
COPY . .
RUN npm ci --only=production
```

### 4. Use .dockerignore

Tạo file `.dockerignore` để loại trừ files không cần thiết:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode
```

### 5. Run as non-root user

```dockerfile
# Tạo user non-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Chuyển ownership của app directory
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs
```

---

## Các instruction nâng cao

### ARG - Build-time variables

ARG định nghĩa variables chỉ có sẵn trong quá trình build.

```dockerfile
# Định nghĩa ARG
ARG NODE_VERSION=18
ARG BUILD_DATE

# Sử dụng ARG
FROM node:${NODE_VERSION}

# ARG có thể có default value
ARG ENVIRONMENT=development

# Sử dụng trong RUN
RUN echo "Building for environment: $ENVIRONMENT"

# Build với custom arguments
# docker build --build-arg NODE_VERSION=16 --build-arg ENVIRONMENT=production .
```

**Sự khác biệt ARG vs ENV**:
- ARG: Chỉ có sẵn trong build time
- ENV: Có sẵn cả build time và runtime

### LABEL - Metadata cho image

```dockerfile
# Basic labels
LABEL maintainer="developer@example.com"
LABEL version="1.0"
LABEL description="My awesome application"

# Multi-line labels
LABEL org.opencontainers.image.title="My App" \
      org.opencontainers.image.description="Application description" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.created="2023-01-01T00:00:00Z"
```

### VOLUME - Persistent data

```dockerfile
# Khai báo mount points
VOLUME ["/data"]
VOLUME ["/var/log", "/var/db"]

# Tạo directory trước khi khai báo volume
RUN mkdir -p /data
VOLUME /data
```

### HEALTHCHECK - Container health monitoring

```dockerfile
# Basic health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Health check cho database
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD pg_isready -U postgres || exit 1

# Disable inherited health check
HEALTHCHECK NONE
```

### ONBUILD - Triggered instructions

ONBUILD instructions chỉ được thực thi khi image được sử dụng làm base cho image khác.

```dockerfile
# Base image for Node.js apps
FROM node:18
ONBUILD COPY package*.json ./
ONBUILD RUN npm ci --only=production
ONBUILD COPY . .
```

---

## Multi-stage builds

Multi-stage builds cho phép sử dụng nhiều FROM statements trong cùng một Dockerfile, giúp tối ưu hóa size của final image.

### Tại sao cần Multi-stage builds?

Trong quá trình phát triển ứng dụng, bạn thường cần:
- Build tools (compiler, bundler, test frameworks)
- Development dependencies
- Source code

Nhưng trong production, bạn chỉ cần:
- Runtime environment
- Production dependencies
- Built artifacts

### Example: Node.js application

```dockerfile
# Stage 1: Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Run tests
RUN npm test

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
```

### Advanced Multi-stage patterns

```dockerfile
# Build stage với specific target
FROM golang:1.19 AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Test stage
FROM go-builder AS tester
RUN go test -v ./...

# Final stage
FROM alpine:latest AS production
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=go-builder /app/main .
CMD ["./main"]
```

### Build specific stages

```bash
# Build chỉ test stage
docker build --target tester .

# Build production stage
docker build --target production -t myapp:prod .
```

---

## Security trong Dockerfile

### 1. Sử dụng non-root user

```dockerfile
# Tạo user và group
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Hoặc sử dụng user có sẵn
RUN adduser --disabled-password --gecos '' appuser

# Chuyển ownership
COPY --chown=appuser:appuser . /app

# Switch user
USER appuser
```

### 2. Minimize attack surface

```dockerfile
# Sử dụng minimal base images
FROM node:18-alpine  # Thay vì node:18 (Ubuntu-based)

# Xóa package manager sau khi cài đặt
RUN apk add --no-cache python3 make g++ && \
    npm install && \
    apk del python3 make g++
```

### 3. Scan for vulnerabilities

```dockerfile
# Cập nhật packages để vá lỗi bảo mật
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 4. Handle secrets properly

```dockerfile
# KHÔNG BAO GIỜ làm thế này
ENV SECRET_KEY=my-secret-key

# Sử dụng build secrets thay thế
# docker build --secret id=mysecret,src=./secret.txt .
RUN --mount=type=secret,id=mysecret \
    SECRET=$(cat /run/secrets/mysecret) && \
    echo "Secret: $SECRET"
```

### 5. Use specific versions

```dockerfile
# Tốt: Version cụ thể
FROM node:18.17.0-alpine3.18

# Không tốt: Version có thể thay đổi
FROM node:latest
```

---

## Optimization và Performance

### 1. Image size optimization

```dockerfile
# Sử dụng Alpine Linux
FROM node:18-alpine

# Multi-stage builds
FROM node:18 AS builder
# ... build steps
FROM node:18-alpine AS production
COPY --from=builder /app/dist ./

# Xóa cache sau khi cài đặt
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    npm cache clean --force && \
    apk del python3 make g++
```

### 2. Layer caching optimization

```dockerfile
# Dependencies ít thay đổi, để trước
COPY package*.json ./
RUN npm ci --only=production

# Source code thay đổi thường xuyên, để sau
COPY . .
```

### 3. Parallel builds

```dockerfile
# Sử dụng BuildKit để enable parallel builds
# syntax=docker/dockerfile:1
FROM node:18 AS deps
COPY package*.json ./
RUN npm ci

FROM node:18 AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18 AS runner
COPY --from=builder /app/dist ./dist
```

### 4. Use .dockerignore effectively

```
# .dockerignore
**/.git
**/node_modules
**/coverage
**/.env.local
**/README.md
Dockerfile
.dockerignore
```

---

## Troubleshooting và Debug

### Common issues và solutions

#### 1. Build context quá lớn

**Problem**: Build chậm vì Docker gửi quá nhiều files
**Solution**: Sử dụng .dockerignore

```
# .dockerignore
node_modules
.git
*.log
coverage/
```

#### 2. Cache không hoạt động

**Problem**: Docker rebuild tất cả layers mặc dù không có gì thay đổi
**Solution**: Sắp xếp lại order của instructions

```dockerfile
# Tốt: Dependencies trước, source sau
COPY package*.json ./
RUN npm install
COPY . .

# Không tốt: Source trước, dependencies sau
COPY . .
RUN npm install
```

#### 3. Permission issues

**Problem**: Container không thể write vào mounted volumes
**Solution**: Set correct user permissions

```dockerfile
RUN adduser --disabled-password --gecos '' appuser
USER appuser
```

#### 4. Large image size

**Problem**: Image quá lớn
**Solutions**:

```dockerfile
# 1. Sử dụng Alpine
FROM node:18-alpine

# 2. Multi-stage builds
FROM node:18 AS builder
# ... build
FROM node:18-alpine AS production
COPY --from=builder /app/dist ./

# 3. Cleanup trong cùng layer
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### Debug techniques

#### 1. Interactive debugging

```bash
# Build đến một stage cụ thể
docker build --target builder -t debug-image .

# Run container interactively
docker run -it debug-image /bin/sh
```

#### 2. Inspect layers

```bash
# Xem history của image
docker history myimage:latest

# Inspect image details
docker inspect myimage:latest
```

#### 3. Build with verbose output

```bash
# Enable BuildKit với debug
DOCKER_BUILDKIT=1 docker build --progress=plain .
```

---

## Examples thực tế

### 1. Node.js Express Application

```dockerfile
# syntax=docker/dockerfile:1

# Multi-stage build for Node.js app
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/server.js"]
```

### 2. Python FastAPI Application

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
FROM base as python-deps
RUN pip install poetry
ENV POETRY_HOME="/opt/poetry" \
    POETRY_CACHE_DIR=/opt/.cache

# Copy poetry files
COPY poetry.lock pyproject.toml ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Production stage
FROM base as production

# Create non-root user
RUN groupadd -r fastapi && useradd -r -g fastapi fastapi

# Set work directory
WORKDIR /app

# Copy installed packages from python-deps stage
COPY --from=python-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-deps /usr/local/bin /usr/local/bin

# Copy application
COPY --chown=fastapi:fastapi . /app

# Switch to non-root user
USER fastapi

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. React Frontend Application

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001

# Change ownership of nginx directories
RUN chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d

# Change ownership of html directory
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Go Microservice

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM golang:1.20-alpine AS builder

# Install git and ca-certificates (needed to be able to call HTTPS)
RUN apk --no-cache add git ca-certificates

# Create appuser
ENV USER=appuser
ENV UID=10001

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o app .

# Final stage
FROM scratch

# Import the user and group files from the builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copy ca-certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary
COPY --from=builder /build/app /app

# Use the unprivileged user
USER appuser:appuser

# Expose port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["/app"]
```

### 5. Database với Custom Configuration

```dockerfile
# syntax=docker/dockerfile:1

FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=myapp \
    POSTGRES_USER=myuser \
    POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password

# Install additional packages
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create directories for custom configuration
RUN mkdir -p /docker-entrypoint-initdb.d \
    /var/lib/postgresql/backup

# Copy custom configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf
COPY pg_hba.conf /etc/postgresql/pg_hba.conf

# Copy initialization scripts
COPY init-scripts/*.sql /docker-entrypoint-initdb.d/

# Copy backup script
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# Expose port
EXPOSE 5432

# Use custom configuration
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
```

---

## Advanced Patterns và Techniques

### 1. Dynamic Base Image Selection

```dockerfile
# syntax=docker/dockerfile:1

ARG VARIANT=alpine
FROM node:18-${VARIANT}

# Conditional logic based on variant
RUN if [ "$VARIANT" = "alpine" ]; then \
        apk add --no-cache python3 make g++; \
    else \
        apt-get update && apt-get install -y python3 make g++; \
    fi

WORKDIR /app
COPY . .
RUN npm install

CMD ["npm", "start"]
```

### 2. Build-time Secret Management

```dockerfile
# syntax=docker/dockerfile:1

FROM alpine:latest

# Mount secret during build
RUN --mount=type=secret,id=api_key \
    API_KEY=$(cat /run/secrets/api_key) && \
    wget --header="Authorization: Bearer $API_KEY" \
         https://api.example.com/data -O /tmp/data.json

# Secret không được lưu trong layer
COPY . .
```

Sử dụng:
```bash
echo "secret-api-key" | docker build --secret id=api_key,src=- .
```

### 3. Cache Mount Optimization

```dockerfile
# syntax=docker/dockerfile:1

FROM node:18-alpine

WORKDIR /app

# Cache mount for npm cache
RUN --mount=type=cache,target=/root/.npm \
    npm install -g npm@latest

COPY package*.json ./

# Cache mount cho node_modules
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules \
    npm ci

COPY . .
CMD ["npm", "start"]
```

### 4. Cross-platform Builds

```dockerfile
# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM

RUN echo "Building on $BUILDPLATFORM for $TARGETPLATFORM"

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

Build cho multiple platforms:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest .
```

---

## Testing Dockerfile

### 1. Container Structure Tests

Tạo file `container-structure-test.yaml`:

```yaml
schemaVersion: 2.0.0

commandTests:
  - name: "app runs"
    command: "node"
    args: ["--version"]
    expectedOutput: ["v18.*"]

  - name: "user is not root"
    command: "whoami"
    expectedOutput: ["appuser"]

fileExistenceTests:
  - name: "app directory exists"
    path: "/app"
    shouldExist: true

  - name: "package.json exists"
    path: "/app/package.json"
    shouldExist: true

metadataTest:
  exposedPorts: ["3000"]
  env:
    - key: "NODE_ENV"
      value: "production"
```

Chạy tests:
```bash
container-structure-test test --image myapp:latest --config container-structure-test.yaml
```

### 2. Dockerfile Linting

Sử dụng hadolint để kiểm tra Dockerfile:

```bash
# Install hadolint
brew install hadolint

# Lint Dockerfile
hadolint Dockerfile
```

Tạo `.hadolint.yaml` cho custom rules:

```yaml
ignored:
  - DL3008  # Pin versions in apt get install
  - DL3009  # Delete the apt-get lists after installing something

failure-threshold: error

format: json
```

### 3. Security Scanning

```bash
# Scan với Trivy
trivy image myapp:latest

# Scan với Snyk
snyk container test myapp:latest

# Scan với Docker Scout
docker scout cves myapp:latest
```

---

## Production Considerations

### 1. Image Tagging Strategy

```dockerfile
# Build arguments for versioning
ARG VERSION=latest
ARG BUILD_DATE
ARG VCS_REF

# Labels for metadata
LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.source="https://github.com/company/myapp"
```

Build script:
```bash
#!/bin/bash
VERSION=${1:-latest}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD)

docker build \
  --build-arg VERSION=$VERSION \
  --build-arg BUILD_DATE=$BUILD_DATE \
  --build-arg VCS_REF=$VCS_REF \
  -t myapp:$VERSION \
  -t myapp:latest \
  .
```

### 2. Health Checks Best Practices

```dockerfile
# Comprehensive health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health \
      --max-time 10 \
      --retry 3 \
      --retry-delay 5 \
      || exit 1

# Health check với custom script
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh
```

`healthcheck.sh`:
```bash
#!/bin/sh
set -e

# Check if app is responding
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "Health check failed: app not responding"
    exit 1
fi

# Check database connection
if ! curl -f http://localhost:3000/db-health > /dev/null 2>&1; then
    echo "Health check failed: database not accessible"
    exit 1
fi

echo "Health check passed"
exit 0
```

### 3. Monitoring và Observability

```dockerfile
# Add monitoring tools
RUN apt-get update && apt-get install -y \
    prometheus-node-exporter \
    && rm -rf /var/lib/apt/lists/*

# Copy monitoring configuration
COPY prometheus.yml /etc/prometheus/
COPY grafana-dashboard.json /etc/grafana/dashboards/

# Expose metrics port
EXPOSE 9090

# Add metrics collection
COPY metrics-collector.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/metrics-collector.sh
```

---

## Automation và CI/CD Integration

### 1. GitLab CI Integration

`.gitlab-ci.yml`:
```yaml
stages:
  - test
  - build
  - security
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:dind

dockerfile-lint:
  stage: test
  image: hadolint/hadolint:latest-debian
  script:
    - hadolint Dockerfile

build:
  stage: build
  image: docker:latest
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

security-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

### 2. GitHub Actions Integration

`.github/workflows/docker.yml`:
```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Lint Dockerfile
      uses: hadolint/hadolint-action@v3.1.0
      with:
        dockerfile: Dockerfile
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: myregistry/myapp:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

---

## Cheat Sheet - Quick Reference

### Essential Commands
```bash
# Build image
docker build -t myapp:latest .

# Build với custom Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build với arguments
docker build --build-arg NODE_ENV=production -t myapp .

# Build multi-platform
docker buildx build --platform linux/amd64,linux/arm64 -t myapp .
```

### Common Patterns
```dockerfile
# Minimal Node.js app
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "start"]

# Multi-stage build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./
CMD ["node", "server.js"]
```

### Troubleshooting Commands
```bash
# Debug build
docker build --no-cache --progress=plain .

# Inspect image
docker inspect myapp:latest

# View image history
docker history myapp:latest

# Run interactive shell
docker run -it myapp:latest /bin/sh
```

---

## Kết luận

Dockerfile là công cụ mạnh mẽ để containerize ứng dụng, nhưng để sử dụng hiệu quả cần hiểu rõ các concepts và best practices. Những điểm quan trọng cần nhớ:

1. **Layer optimization**: Sắp xếp instructions hợp lý để tận dụng cache
2. **Security**: Luôn chạy ứng dụng với non-root user
3. **Size optimization**: Sử dụng multi-stage builds và minimal base images
4. **Maintainability**: Sử dụng explicit versions và proper documentation
5. **Testing**: Implement proper health checks và container testing

Dockerfile tốt không chỉ chạy được mà còn secure, efficient và maintainable. Thực hành thường xuyên với các patterns khác nhau sẽ giúp bạn master công cụ này.

### Next Steps

1. Thực hành với các examples trong guide này
2. Đọc thêm về Docker BuildKit features
3. Tìm hiểu về container orchestration (Kubernetes, Docker Swarm)
4. Học về monitoring và logging trong containers
5. Explore advanced security practices

Happy containerizing! 🐳