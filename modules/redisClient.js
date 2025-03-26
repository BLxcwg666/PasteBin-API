const redis = require('redis');

const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

async function connectRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis successfully');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1); // 终止应用如果连接失败
  }
}

module.exports = { client, connectRedis };