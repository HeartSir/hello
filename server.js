const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // 允许跨域（让你的网页能访问）
app.use(bodyParser.json());

// 配置数据库连接
const db = mysql.createConnection({
    host: 'mysql2.sqlpub.com',
    port: 3307,           // 注意端口是 3307
    user: 'shh666',
    password: 'm58qZaUcSZTT0rgP', // 【⚠️重要】这里填你那个8位的密码
    database: 'shhweb'
});

db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('成功连接到远程数据库！');
    }
});

// 接收数据的接口
app.post('/api/save', (req, res) => {
    const { username, role, message } = req.body;
    
    const sql = 'INSERT INTO chat_logs (username, role, message) VALUES (?, ?, ?)';
    db.query(sql, [username, role, message], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('保存失败');
        } else {
            res.send('保存成功');
        }
    });
});

// 启动服务器，端口 3000
app.listen(3000, () => {
    console.log('后端服务器已启动：http://localhost:3000');
});