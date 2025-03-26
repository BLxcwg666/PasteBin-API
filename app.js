const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const dotenv = require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});