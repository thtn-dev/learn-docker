# Express.js Simple Application

Ứng dụng Express.js đơn giản với các tính năng cơ bản.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## API Endpoints

### 1. Trang chủ
- **GET** `/`
- Trả về thông tin chào mừng

### 2. Health Check
- **GET** `/api/health`
- Kiểm tra trạng thái server

### 3. Hello API
- **GET** `/api/hello/:name`
- Chào mừng với tên cụ thể
- Ví dụ: `/api/hello/John`

### 4. Echo API
- **POST** `/api/echo`
- Echo lại dữ liệu được gửi
- Body: JSON

## Ví dụ sử dụng

### Gọi API Hello
```bash
curl http://localhost:3000/api/hello/TrungNam
```

### Gọi API Echo
```bash
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

## Docker

Để chạy với Docker, sử dụng Dockerfile có sẵn:

```bash
docker build -t simple-expressjs .
docker run -p 3000:3000 simple-expressjs
```

## Cấu trúc project

```
expressjs/
├── app.js          # File chính của ứng dụng
├── package.json    # Dependencies và scripts
├── dockerfile      # Docker configuration
└── README.md       # Tài liệu này
```
