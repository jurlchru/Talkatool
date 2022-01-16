const { Model, DataTypes } = require('sequelize');
const seq = require('../index');

class Reply extends Model {
  /**
   * @param {import('discord.js').Message} message
   * @returns {String}
   */
  static prepareContent(message) {
    let content = message.content;
    message.attachments.each((attachment) => (content += `\n${attachment.url}`));
    message.stickers.each((sticker) => (content += `\n${sticker.url}`));
    return content.trim();
  }
}

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
