const db = require('../connection');

const getEvents = () => {
  return db.query('SELECT * FROM music_events;')
    .then(data => {
      
      return data.rows;
    
    });
};


const deleteEvent = (eventId) => {
  return db.query('DELETE FROM music_events WHERE id = $1', [eventId])
    .then(() => {
      return 'Event deleted successfully';
    })
    .catch((error) => {
      throw error;
    });
};

module.exports = { getEvents, deleteEvent };