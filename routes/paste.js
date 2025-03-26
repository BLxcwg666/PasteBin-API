const { v4: uuidv4 } = require('uuid');
const { client } = require('../modules/redisClient');
const { validatePaste } = require('../utils/validate');

const PASTE_TTL = {
  '5m': 300,
  '10m': 600,
  '1d': 86400,
  '1w': 604800,
  '1m': 2592000,
  '1y': 31536000,
  'burn': 60,
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

async function addPaste(req, res) {
  const { owner = 'Anonymous', title = '', content, languageId, keeping } = req.body;
  if (!validatePaste(content, keeping) || !LANGUAGE_MAP[languageId]) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const id = uuidv4();
  const ttl = PASTE_TTL[keeping] || 300;
  const paste = { id, owner, title, content, language: LANGUAGE_MAP[languageId], keeping };

  await client.setEx(id, ttl, JSON.stringify(paste));
  return res.status(201).json({ message: 'Paste created', id });
}

async function getPaste(req, res) {
  const { id } = req.params;
  const paste = await client.get(id);

  if (!paste) return res.status(404).json({ error: 'Paste not found' });

  const parsedPaste = JSON.parse(paste);
  if (parsedPaste.keeping === 'burn') await client.del(id);

  return res.json(parsedPaste);
}

async function deletePaste(req, res) {
  const { id, token } = req.body;
  const result = await client.del(id);
  return res.json(result ? { message: 'Paste deleted' } : { error: 'Paste not found' });
}

module.exports = { addPaste, getPaste, deletePaste };