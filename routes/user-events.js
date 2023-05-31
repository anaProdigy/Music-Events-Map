const express = require('express');
const router = express.Router();
const eventQueries = require('../db/queries/events');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/', (req, res) => {
  eventQueries.getUserEvents()
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
