const express = require('express');
const router = express.Router();
const { client } = require('../modules/redisClient');

router.post('/', async (req, res) => {
  const { id, token } = req.body;

  const paste = await client.get(id);
  if (!paste) return res.status(404).json({ error: 'Paste not found' });

  const parsedPaste = JSON.parse(paste);

  if (parsedPaste.token !== token) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  const result = await client.del(id);
  res.json(result ? { message: 'Paste deleted' } : { error: 'Paste not found' });
});

module.exports = router;