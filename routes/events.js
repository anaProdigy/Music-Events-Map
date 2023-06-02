const express = require('express');
const router = express.Router();
const eventQueries = require('../db/queries/events');

// get all events
router.get('/', (req, res) => {
  const userId = req.cookies.user_id;
  eventQueries.getEvents(userId)
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

// Get favorite events for a user
router.get('/favorite/:userId', (req, res) => {
  const userId = req.params.userId;

  eventQueries.getFavoriteEvents(userId)
    .then(favoriteEvents => {
      res.json({ favoriteEvents });
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
    })
    .catch((e) => {
      console.error(e);
      res.send(e);
    });
});

// Add favorite event POST /api/events/favorite
router.post('/favorite', (req, res) => {
  const userId = req.cookies.user_id;
  const { eventId } = req.body;
  // Call the addFavoriteEvent function with the userId and eventId
  eventQueries.addFavoriteEvent(userId, eventId)
    .then((favoriteEvent) => {
      // Return the added favorite event as the response
      res.json({ favoriteEvent });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to add event to favorites' });
    });
});


// edit user-created event
//eventId IN MINE?????????????????????
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

// DELETE FROM FAVORITE EVNETS
router.delete('/favorites/:eventId', (req, res) => {
  const userId = req.cookies.user_id;
  const eventId = req.params.eventId;

  eventQueries.deleteFavoriteEvents(userId, eventId)
    .then(() => {
      console.log("FIRE", eventId);
      res.json({ message: 'Event deleted successfully' });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});


module.exports = router;

