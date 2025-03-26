const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const dotenv = require('dotenv').config();
const { client, connectRedis } = require('./modules/redisClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/', router);

app.listen(PORT, async () => {
  await connectRedis();
  console.log(`Server running on http://localhost:${PORT}`);
});