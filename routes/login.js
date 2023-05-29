const express = require('express');
const router = express.Router();

router.get('/login/:user_id', (req, res) => {
    res.cookie('user_id', req.params.user_id);
    res.redirect('/');
});

module.exports = router;
