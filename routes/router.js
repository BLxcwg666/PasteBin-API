const express = require('express');
const { addPaste, getPaste, deletePaste } = require('./paste');

const router = express.Router();

router.get('/pastes/:id', getPaste);
router.post('/add', addPaste);
router.post('/del', deletePaste);

module.exports = router;