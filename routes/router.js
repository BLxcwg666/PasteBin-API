const express = require('express');

const router = express.Router();

router.use('/pastes', require("./get"));
router.use('/add', require("./add"));
router.use('/del', require("./del"));

router.use((req, res) => {
    res.json({ success: false, msg: "你在找什么喵？" });
});

module.exports = router;