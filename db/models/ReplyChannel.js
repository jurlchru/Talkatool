const { Model, DataTypes } = require('sequelize');
const seq = require('../index');

class ReplyChannel extends Model {}

ReplyChannel.init(
  {
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: seq,
    modelName: 'ReplyChannel',
  }
);

module.exports = ReplyChannel;
