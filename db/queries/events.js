const db = require('../connection');

const getEvents = () => {
  return db.query('SELECT * FROM music_events;')
    .then(data => {

      return data.rows;

    });
};

const getCreatedEvents = (userId) => {
  const query = 'SELECT * FROM music_events WHERE creator_id = $1';

  return db.query(query, [userId])
    .then(data => {
      return data.rows;
    });
};

const addEvent = function (event) {
  console.log("EVENT ", event);
  const queryString = `
  INSERT INTO music_events (creator_id, name, description, start_date, end_date, venue, city, latitude, longitude,
  event_link_url, event_thumbnail_url)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *;`;
  const queryParams = [event.creator_id, event.name, event.description, event.start_date, event.end_date, event.venue,
  event.city, event.latitude, event.longitude, event.event_link_url, event.event_thumbnail_url];
  console.log("query", queryString);
  return db
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw error;
    })
};

const editEvent = (event, eventId) => {
  const queryString = `
  UPDATE music_events
  SET name = $1, description = $2, start_date = $3, end_date = $4, venue = $5, city = $6, latitude = $7, longitude = $8,
  event_link_url = $9, event_thumbnail_url = $10
  WHERE id = $11`;
  const queryParams = [event.name, event.description, event.start_date, event.end_date, event.venue,
  event.city, event.latitude, event.longitude, event.event_link_url, event.event_thumbnail_url, eventId];
  return db
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw error;
    })
}


const deleteEvent = (eventId) => {
  return db.query('DELETE FROM music_events WHERE id = $1', [eventId])
    .then(() => {
      return 'Event deleted successfully';
    })
    .catch((error) => {
      throw error
    });
};

module.exports = { getEvents, addEvent, editEvent, deleteEvent, getCreatedEvents };
