const db = require('../connection');

// Return name of logged-in user
const getLoggedInUser = (userId) => {
  return db.query(`SELECT name FROM users WHERE id = $1;`, [userId])
    .then(data => {
      return data.rows;
    })
    .catch((error) => {
      throw error;
    })
};

module.exports = { getLoggedInUser };
