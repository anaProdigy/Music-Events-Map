const express = require('express');
const router = express.Router();
const eventQueries = require('../db/queries/events');

// get all events
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

// get user-created events
router.get('/created/:user_id', (req, res) => {
  const userId = req.params.user_id;
  if (!userId) {
    return res.send({ error: "error" });
  }
  eventQueries.getCreatedEvents(userId)
    .then(createdEvents => {
      res.json({ createdEvents });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// add new event
router.post('/', (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.send({ error: "error" });
  }
  const newEvent = req.body;
  newEvent.creator_id = userId;
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

// edit user-created event
router.post('/:event_id', (req, res) => {
  const userId = req.cookies.user_id;
  const eventId = req.params.event_id;
  if (!userId) {
    return res.send({ error: "error" });
  }
  eventQueries
    .editEvent(req.body, eventId)
    .then((event) => {
      const response = {
        event: event,
        editedEvent: true
      };
      res.send(response);
    })
    .catch((e) => {
      console.error(e);
      res.send(e);
    });
});

// delete user-created event
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

