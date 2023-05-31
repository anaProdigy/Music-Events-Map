const db = require('../connection');

const getEvents = () => {
  return db.query('SELECT * FROM music_events;')
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
  const queryParams = [event.creator_id, event.name, event.description, event['start-date'], event['end-date'], event.venue,
  event.city, event.latitude, event.longitude, event['event-link'], event['event-thumbnail']];
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

const editEvent = (event) => {
  const queryString = `
  UPDATE music_events
  SET creator_id = $1, name = $2, description = $3, start_date = $4, end_date = $5, venue = $6, city = $7, latitude = $8, longitude = $9,
  event_link_url = $10, event_thumbnail_url = $11)
  WHERE id = $12`;
  const queryParams = [event.creator_id, event.name, event.description, event['start-date'], event['end-date'], event.venue,
  event.city, event.latitude, event.longitude, event['event-link'], event['event-thumbnail'], event.id];
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

module.exports = { getEvents, addEvent, editEvent, deleteEvent };
