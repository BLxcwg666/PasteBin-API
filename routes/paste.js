const { randomId } = require("./../utils/randomId");
const { client } = require("../modules/redisClient");
const { validatePaste } = require("../utils/validate");

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

async function addPaste(req, res) {
  const { owner = 'Anonymous', title = 'Untitled', content, languageId, keeping } = req.body;

  if (!validatePaste(content, keeping) || !LANGUAGE_MAP[languageId]) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const id = randomId(8);
  const token = randomId(16); // token for deletion
  const ownerToken = randomId(16); // token for mark as first read
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
    ownerToken
  };

  if (keeping === 'burn') {
    await client.set(id, JSON.stringify(paste)); // do not set ttl for burn
  } else {
    await client.setEx(id, ttl, JSON.stringify(paste)); // set ttl normal
  }

  return res.status(201).json({
    message: 'Paste created',
    id,
    token,
    createdAt,
    expiresAt: paste.expiresAt,
    ownerToken
  });
}

async function getPaste(req, res) {
  const { id } = req.params;
  const { ownerToken } = req.query;

  const paste = await client.get(id);
  if (!paste) return res.status(404).json({ error: 'Paste not found' });

  const parsedPaste = JSON.parse(paste);
  console.log(`Stored ownerToken: ${parsedPaste.ownerToken}`);

  if (parsedPaste.keeping === 'burn') {
    if (parsedPaste.ownerToken && ownerToken === parsedPaste.ownerToken) {
      return res.json(parsedPaste);
    } else {
      console.log("Non-author visited, burning paste.");
      res.json(parsedPaste);
      setTimeout(async () => {
        await client.del(id);
        console.log(`Paste ${id} has been burned.`);
      }, 0);
    }
  } else {
    return res.json(parsedPaste);
  }
}

async function deletePaste(req, res) {
  const { id, token } = req.body;

  const paste = await client.get(id);
  if (!paste) return res.status(404).json({ error: 'Paste not found' });

  const parsedPaste = JSON.parse(paste);

  if (parsedPaste.token !== token) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  const result = await client.del(id);
  return res.json(result ? { message: 'Paste deleted' } : { error: 'Paste not found' });
}

module.exports = { addPaste, getPaste, deletePaste };