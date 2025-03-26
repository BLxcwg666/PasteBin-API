const redis = require('redis');
const log = require('./logger');
const config = require('./../config');

const client = redis.createClient({
  url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`
});

client.on('error', (err) => {
  log.err(err, "REDIS")
});

async function connectRedis() {
  try {
    await client.connect();
    log.ok('成功连接到数据库~', 'REDIS');
  } catch (err) {
    log.err(err, 'REDIS');
    process.exit(1); // 终止应用如果连接失败
  }
}

module.exports = { client, connectRedis };