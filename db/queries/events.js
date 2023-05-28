const db = require('../connection');

const getEvents = () => {
  return db.query('SELECT * FROM music_events;')
    .then(data => {
      
      return data.rows;
    
    });
};

module.exports = { getEvents };