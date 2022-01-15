const { Model, DataTypes } = require('sequelize');
const seq = require('../index');

class Reply extends Model {}

Reply.init(
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: seq,
    modelName: 'Reply',
  }
);

module.exports = Reply;
