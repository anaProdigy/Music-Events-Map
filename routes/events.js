const express = require('express');
const router = express.Router();
const eventQueries = require('../db/queries/events');

router.get('/', (req, res) => {
  eventQueries.getEvents()
    .then(events => {
      res.json({ events });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

router.post('/', (req, res) => {

  console.log("we are hiiting this route");
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.send({ error: "error" });
  }
  // // console.log(req.body);
  const newEvent = req.body;
  newEvent.creator_id = userId;
  console.log('newEvent: ', newEvent);
  eventQueries
    .addEvent(newEvent)
    .then((event) => {
      console.log("In promise", event);
      res.redirect("/");
      //res.send(event); //this can be for AJAX
    })
    .catch((e) => {
      console.error(e);
      res.send(e);
    });
});

router.put('/:eventId', (req, res) => {
  const userId = req.cookies.user_id;
  const eventId = req.params.eventId;
  if (!userId) {
    return res.send({ error: "error" });
  }
  const event = req.body;
  event.creator_id = userId;
  eventQueries
    .editEvent(eventId)
  .then((event) => {
    console.log("In promise", event);
    res.redirect("/");
  })
  .catch((e) => {
    console.error(e);
    res.send(e);
  });
});

router.delete('/:eventId', (req, res) => {
  const eventId = req.params.eventId;

  eventQueries.deleteEvent(eventId)
    .then(() => {
      res.json({ message: 'Event deleted successfully' });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;

