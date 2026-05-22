const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoute = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
});

// 单文件上传
uploadRoute.post('/', upload.single('file'), (req, res, next) => {
    console.log('运行文件上传');
    try {
        if (!req.file) {
            return res.status(400).send({ message: '请选择文件' });
        }
        // 返回文件访问URL
        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).send({
            message: '上传成功',
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.log('上传失败:', error);
        next(error);
    }
});

module.exports = uploadRoute;
