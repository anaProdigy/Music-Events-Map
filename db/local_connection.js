// PG database client/connection setup
//copy this to other file with qieries for example events.js to test queries from db
// const db = require('../local_connection');


const { Pool } = require('pg');

const dbParams = {
  host: 'localhost',
  port: '5432',
  user: 'labber',
  password: 'labber',
  database: 'midterm'
};
console.log("dbParams", dbParams)
const db = new Pool(dbParams);

db.connect();

module.exports = db;
