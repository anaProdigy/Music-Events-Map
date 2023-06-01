const express = require('express');
const router = express.Router();
const eventQueries = require('../db/queries/events');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/', (req, res) => {
  eventQueries.getEvents()
    .then(events => {
      // console.log("server events",events)
      res.json({ events });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

router.get('/created/:userId', (req, res) => {
  const userId = req.params.userId;
console.log("line23", userId)
  eventQueries.getCreatedEvents(userId)
    .then(createdEvents => {
      res.json({ createdEvents });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

router.post('/', (req, res) => {

  // console.log("we are hiiting this route");
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

      console.log('line 52', response)
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

router.post('/:eventId', (req, res) => {
  const userId = req.cookies.user_id;
  const eventId = req.params.eventId;
  if (!userId) {
    return res.send({ error: "error" });
  }
  console.log(req.body);
  eventQueries
    .editEvent(req.body, eventId)
    .then((event) => {
      const response = {
        event: event,
        editedEvent: true
      };
      console.log('line 75', response)
      res.send(response);
      // res.redirect("/");
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

