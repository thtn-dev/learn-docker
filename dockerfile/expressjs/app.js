const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware để log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Route chính
app.get('/', (req, res) => {
    res.json({
        message: 'Chào mừng đến với ứng dụng Express.js đơn giản!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Route API đơn giản
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Route với tham số
app.get('/api/hello/:name', (req, res) => {
    const { name } = req.params;
    res.json({
        message: `Xin chào, ${name}!`,
        timestamp: new Date().toISOString()
    });
});

// POST route
app.post('/api/echo', (req, res) => {
    res.json({
        message: 'Echo từ server',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route không tồn tại',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Có lỗi xảy ra trên server',
        timestamp: new Date().toISOString()
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👋 Hello API: http://localhost:${PORT}/api/hello/yourname`);
});

module.exports = app;
