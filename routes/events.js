const express = require('express');
const router = express.Router();
const eventQueries = require('../db/queries/events');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

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
      const response = {
        event: event,
        addedEvent: true
      };
      res.send(response);
      // console.log("In promise", event);
      //  res.redirect("/");
      // //res.send(event); //this can be for AJAX
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
  req.body.creator_id = user_id;
  eventQueries
    .editEvent(eventId)
    .then((event) => {
      const response = {
        event: event,
        editedEvent: true
      };
      res.send(response);
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

