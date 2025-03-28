const express = require('express');
const router = express.Router();
const { client } = require('../modules/redisClient');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { ownerToken } = req.query;

  const paste = await client.get(id);
  if (!paste) return res.status(404).json({ error: 'Paste not found' });

  const parsedPaste = JSON.parse(paste);

  if (parsedPaste.keeping === 'burn') {
    if (parsedPaste.ownerToken && ownerToken === parsedPaste.ownerToken) {
      return res.json(parsedPaste);
    } else {
      res.json(parsedPaste);
      setTimeout(async () => {
        await client.del(id);
      }, 0);
    }
  } else {
    return res.json(parsedPaste);
  }
});

module.exports = router;