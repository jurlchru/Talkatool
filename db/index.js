const { Sequelize } = require('sequelize');

const seq = new Sequelize({
  dialect: 'sqlite',
  database: 'talkatool',
  username: 'bot',
  password: 'bot',
  host: './talkatool.db',
});

module.exports = seq;
