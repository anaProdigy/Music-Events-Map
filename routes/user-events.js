const express = require('express');
const router = express.Router();
const userEventQueries = require('../db/queries/user-events');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/', (req, res) => {
  userEventQueries.getUserEvents()
    .then(events => {
      res.json({ events });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

module.exports = router;
