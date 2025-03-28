const express = require('express');
const router = express.Router();
const { randomId } = require('../utils/randomId');
const { client } = require('../modules/redisClient');
const { validatePaste } = require('../utils/validate');

const PASTE_TTL = {
  '5m': 300,
  '10m': 600,
  '1d': 86400,
  '1w': 604800,
  '1m': 2592000,
  '1y': 31536000,
};

const LANGUAGE_MAP = {
  1: 'Plain Text',
  2: 'HTML',
  3: 'JavaScript',
  4: 'TypeScript',
  5: 'PHP',
  6: 'Go',
  7: 'C++',
  8: 'C',
  9: 'Python',
};

router.post('/', async (req, res) => {
  const { owner = 'Anonymous', title = 'Untitled', content, languageId, keeping } = req.body;

  if (!validatePaste(content, keeping) || !LANGUAGE_MAP[languageId]) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const id = randomId(8);
  const token = randomId(16);
  const ownerToken = randomId(16);
  const ttl = PASTE_TTL[keeping] || 300;

  const createdAt = Date.now();
  const expiresAt = createdAt + ttl * 1000;

  const paste = {
    id,
    owner,
    title,
    content,
    language: LANGUAGE_MAP[languageId],
    keeping,
    token,
    createdAt,
    expiresAt: keeping === 'burn' ? undefined : expiresAt,
    ownerToken,
  };

  if (keeping === 'burn') {
    await client.set(id, JSON.stringify(paste));
  } else {
    await client.setEx(id, ttl, JSON.stringify(paste));
  }

  res.status(201).json({
    message: 'Paste created',
    id,
    token,
    createdAt,
    expiresAt: paste.expiresAt,
    ownerToken,
  });
});

module.exports = router;