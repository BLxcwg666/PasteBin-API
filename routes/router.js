const express = require('express');
const { addPaste, getPaste, deletePaste } = require('./paste');

const router = express.Router();

router.get('/pastes/:id', getPaste);
router.post('/add', addPaste);
router.post('/del', deletePaste);

router.use((req, res) => {
    res.json({ success: false, msg: "你在找什么喵？" });
});

module.exports = router;