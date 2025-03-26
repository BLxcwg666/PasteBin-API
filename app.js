const cors = require("cors");
const express = require('express');
const cluster = require('cluster');
const config = require('./config');
const log = require('./modules/logger');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const dotenv = require('dotenv').config();
const numCPUs = require('os').cpus().length;
const { connectRedis } = require('./modules/redisClient');

const host = config.API_HOST;
const port = config.API_PORT;

global.version = "0.1.0";
global.time = function () {
    return moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
}

if (cluster.isPrimary) {
    log.info("尝试连接到数据库...", "APP")
    connectRedis()
        .then(() => {
            // 复制线程
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            // 启动 API
            const app = express();

            app.use(cors());
            app.use(bodyParser.json());
            app.use('/', router);

            app.listen(port, host, async () => {
                log.info(`API Started at port ${port} on ${host}`, "APP")
            });

        });

    cluster.on('exit', (worker, code, signal) => {
        log.warn(`线程 PID ${worker.process.pid} 已退出，代码：${code}`, "APP")
        log.info(`尝试启动新线程`, "APP")
        cluster.fork(); // 重新启动子进程
    });
}