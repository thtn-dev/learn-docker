# Docker CLI Commands Reference

## 1. Quản lý Images

### Build và Tag Images
```bash
# Build image từ Dockerfile
docker build -t <image_name>:<tag> .
docker build -t myapp:latest .

# Build với arguments
docker build --build-arg ARG_NAME=value -t myapp:latest .

# Tag image
docker tag <source_image> <target_image>
docker tag myapp:latest myapp:v1.0
```

### Quản lý Images
```bash
# Liệt kê images
docker images
docker image ls

# Xóa image
docker rmi <image_id>
docker rmi myapp:latest

# Xóa tất cả images không sử dụng
docker image prune

# Pull image từ registry
docker pull <image_name>:<tag>
docker pull nginx:latest

# Push image lên registry
docker push <image_name>:<tag>
```

## 2. Quản lý Containers

### Chạy Containers
```bash
# Chạy container cơ bản
docker run <image_name>
docker run nginx

# Chạy container với port mapping
docker run -p <host_port>:<container_port> <image_name>
docker run -p 8080:80 nginx

# Chạy container ở background (detached mode)
docker run -d <image_name>
docker run -d -p 8080:80 nginx

# Chạy container với tên tùy chỉnh
docker run --name <container_name> <image_name>
docker run --name my-nginx -d -p 8080:80 nginx

# Chạy container với volume mount
docker run -v <host_path>:<container_path> <image_name>
docker run -v /host/data:/app/data myapp

# Chạy container với environment variables
docker run -e ENV_VAR=value <image_name>
docker run -e NODE_ENV=production -e PORT=3000 myapp

# Chạy container interactive
docker run -it <image_name> /bin/bash
```

### Quản lý Containers
```bash
# Liệt kê containers đang chạy
docker ps

# Liệt kê tất cả containers (bao gồm stopped)
docker ps -a

# Dừng container
docker stop <container_id>
docker stop my-nginx

# Khởi động lại container
docker restart <container_id>

# Xóa container
docker rm <container_id>
docker rm my-nginx

# Xóa tất cả containers đã dừng
docker container prune

# Xem logs của container
docker logs <container_id>
docker logs -f my-nginx  # Follow logs

# Truy cập vào container đang chạy
docker exec -it <container_id> /bin/bash
docker exec -it my-nginx sh
```

## 3. Docker Compose

### Cơ bản
```bash
# Chạy services từ docker-compose.yml
docker-compose up

# Chạy ở background
docker-compose up -d

# Build và chạy
docker-compose up --build

# Dừng services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Xem logs
docker-compose logs
docker-compose logs <service_name>

# Scale service
docker-compose up --scale <service_name>=<number>
```

## 4. Networks

```bash
# Liệt kê networks
docker network ls

# Tạo network
docker network create <network_name>
docker network create my-network

# Kết nối container vào network
docker network connect <network_name> <container_name>

# Ngắt kết nối container khỏi network
docker network disconnect <network_name> <container_name>

# Xem thông tin network
docker network inspect <network_name>

# Xóa network
docker network rm <network_name>
```

## 5. Volumes

```bash
# Liệt kê volumes
docker volume ls

# Tạo volume
docker volume create <volume_name>
docker volume create my-data

# Xem thông tin volume
docker volume inspect <volume_name>

# Xóa volume
docker volume rm <volume_name>

# Xóa tất cả volumes không sử dụng
docker volume prune

# Sử dụng volume khi chạy container
docker run -v <volume_name>:<container_path> <image_name>
docker run -v my-data:/app/data myapp
```

## 6. Thông tin hệ thống

```bash
# Xem thông tin Docker
docker info

# Xem version
docker version

# Xem disk usage
docker system df

# Dọn dẹp hệ thống (xóa tất cả unused objects)
docker system prune

# Dọn dẹp toàn bộ (bao gồm cả volumes)
docker system prune -a --volumes

# Xem processes đang chạy trong container
docker top <container_id>

# Xem resource usage
docker stats
docker stats <container_id>
```

## 7. Registry và Repository

```bash
# Login vào Docker Hub
docker login

# Login vào private registry
docker login <registry_url>

# Logout
docker logout

# Search images trên Docker Hub
docker search <term>
docker search nginx

# Pull image từ private registry
docker pull <registry_url>/<image_name>:<tag>
```

## 8. Dockerfile Commands

### Các lệnh cơ bản trong Dockerfile
```dockerfile
# Base image
FROM ubuntu:20.04

# Maintainer info
LABEL maintainer="your-email@example.com"

# Set working directory
WORKDIR /app

# Copy files
COPY . /app
ADD archive.tar.gz /app

# Run commands
RUN apt-get update && apt-get install -y nginx

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose ports
EXPOSE 80 443

# Set user
USER nginx

# Entry point
ENTRYPOINT ["nginx"]

# Default command
CMD ["-g", "daemon off;"]

# Volume
VOLUME ["/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

## 9. Các câu lệnh hữu ích khác

```bash
# Copy file từ container ra host
docker cp <container_id>:/path/to/file /host/path

# Copy file từ host vào container
docker cp /host/path <container_id>:/path/to/file

# Inspect container/image
docker inspect <container_id>
docker inspect <image_name>

# Xem history của image
docker history <image_name>

# Save image thành tar file
docker save -o myimage.tar <image_name>

# Load image từ tar file
docker load -i myimage.tar

# Export container thành tar file
docker export <container_id> > container.tar

# Import container từ tar file
docker import container.tar <new_image_name>

# Xem port mapping của container
docker port <container_id>

# Kill container (force stop)
docker kill <container_id>

# Pause/unpause container
docker pause <container_id>
docker unpause <container_id>

# Rename container
docker rename <old_name> <new_name>
```

## 10. Tips và Best Practices

### Multi-stage builds
```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Health checks
```bash
# Chạy container với health check
docker run -d --health-cmd="curl -f http://localhost/ || exit 1" \
  --health-interval=30s --health-timeout=3s nginx
```

### Resource limits
```bash
# Giới hạn memory và CPU
docker run -m 512m --cpus="1.5" nginx

# Giới hạn restart policy
docker run --restart=unless-stopped nginx
```

## Tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/)