const db = require('../connection');

const getUserEvents = () => {
  return db.query('SELECT * FROM user_events;')
    .then(data => {
      return data.rows;
    });
};

module.exports = { getUserEvents };
