const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // 【新增 1】引入请求工具

require('dotenv').config();

const app = express();
app.use(cors()); // 允许跨域
app.use(bodyParser.json());

// --- 数据库连接配置 ---
const db = mysql.createConnection({
    host: 'mysql2.sqlpub.com',
    port: 3307,
    user: 'shh666',
    // 【优化】优先从环境变量读取密码，如果没有则用硬编码的（为了安全建议在Render设置 DB_PASSWORD）
    password: process.env.DB_PASSWORD,
    database: 'shhweb'
});

db.connect(err => {
    if (err) {
        console.error('❌ 数据库连接失败:', err);
    } else {
        console.log('✅ 成功连接到远程数据库！');
    }
});

// --- 【新增 2】聊天接口 (隐藏 API Key) ---
app.post('/api/chat', async (req, res) => {
    const { messages, temperature } = req.body;

    // 从 Render 环境变量获取 Key，确保代码里不包含 Key
    const apiKey = process.env.MY_API_KEY; 
    const apiUrl = "https://free.v36.cm/v1/chat/completions";

    if (!apiKey) {
        return res.status(500).json({ error: "服务器端未配置 API Key" });
    }

    try {
        console.log("正在向 GPT 中转服务发送请求...");
        const response = await axios.post(apiUrl, {
            model: "gpt-4o-mini",
            messages: messages,
            temperature: temperature
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        // 把 GPT 的结果返回给前端
        res.json(response.data);

    } catch (error) {
        console.error("GPT 请求失败:", error.message);
        // 如果有详细的响应数据，打印出来方便调试
        if (error.response) console.error(error.response.data);
        
        res.status(500).json({ error: "AI 服务暂时不可用" });
    }
});

// --- 原有的保存数据接口 ---
app.post('/api/save', (req, res) => {
    const { username, role, message } = req.body;
    console.log(`📝 保存日志: [${role}] ${message.substring(0, 20)}...`);
    
    const sql = 'INSERT INTO chat_logs (username, role, message) VALUES (?, ?, ?)';
    db.query(sql, [username, role, message], (err, result) => {
        if (err) {
            console.error('保存数据库出错:', err);
            res.status(500).send('保存失败');
        } else {
            res.send('保存成功');
        }
    });
});

// --- 【修改 3】启动服务器 (适配 Render) ---
// Render 会提供一个 process.env.PORT，必须使用它
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 后端服务器已启动，端口：${port}`);
});