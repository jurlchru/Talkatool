const Discord = require('discord.js');
const { Op } = require('sequelize');
const seq = require('./db');
const config = require('./app/config.json');
const Reply = require('./db/models/Reply');
const ReplyChannel = require('./db/models/ReplyChannel');

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(config.prefix)) {
    const command = message.content.slice(config.prefix.length).split(/ /)[0].trim();
    const args = message.content.slice(config.prefix.length).split(/ /).slice(1).join(' ').trim();

    // commands
    if (command.toLowerCase() === 'setup') {
      try {
        const replyChannel = await ReplyChannel.create({
          channel_id: message.channel.id,
          guild_id: message.guild.id,
        });

        await message.reply(`The channel <#${replyChannel.channel_id}> has been set up for automatic replies.`);
      } catch (e) {
        await message.reply(`Error setting up the channel.\nError: \`${e.message}\``);
      }
    } else if (command.toLowerCase() === 'unset') {
      try {
        const replyChannel = await ReplyChannel.findOne({
          where: {
            channel_id: message.channel.id,
            guild_id: message.guild.id,
          },
        });
        if (!replyChannel) {
          await message.reply(`This channel is currently not set up for automatic replies.`);
          return;
        }

        await replyChannel.destroy();

        await message.reply(`The channel <#${replyChannel.channel_id}> has been removed from automatic replies.`);
      } catch (e) {
        await message.reply(`Error unsetting the channel.\nError: \`${e.message}\``);
      }
    } else if (command.toLowerCase() === 'get') {
      const reply = await Reply.findOne({
        where: {
          id: args,
          guild_id: message.guild.id,
        },
      });
      if (!reply) {
        await message.reply('Reply not found.');
        return;
      }

      await message.reply({
        content: `Reply ID: \`${reply.id}\` Sent by: <@${reply.user_id}>\n${reply.content}`,
        allowedMentions: {
          parse: [],
        },
      });
    } else if (command.toLowerCase() === 'search') {
      const replies = await Reply.findAll({
        where: {
          content: { [Op.substring]: args },
        },
      });
      if (!replies.length) {
        await message.reply('No replies found.');
        return;
      }

      const embed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`Search Results for "${args}"`)
        .setFooter({
          text: `Total Results: ${replies.length}`,
        });

      const previewLength = 80;
      const maxReplies = 24;
      let i = 0;
      while (i < maxReplies && i < replies.length) {
        const reply = replies[i];
        const preview =
          reply.content.length > previewLength ? reply.content.substring(0, previewLength) + '...' : reply.content;
        embed.addField(`Reply ID: ${reply.id}`, preview, true);
        i++;
      }

      if (replies.length > maxReplies) {
        const omitted = replies.length - maxReplies;
        embed.addField('...', `${omitted} ${omitted === 1 ? 'reply' : 'replies'} omitted.`);
      }

      await message.reply({
        embeds: [embed],
      });
    } else if (command.toLowerCase() === 'delete') {
      const reply = await Reply.findOne({
        where: {
          id: args,
          guild_id: message.guild.id,
        },
      });
      if (!reply) {
        await message.reply('Reply not found.');
        return;
      }

      try {
        await reply.destroy();
        await message.reply(`The reply has been deleted.`);
      } catch (e) {
        await message.reply(`Error deleting reply.\nError: \`${e.message}\``);
      }
    }
  }
  // replies
  else {
    const isReplyChannel =
      (await ReplyChannel.findOne({
        where: {
          channel_id: message.channel.id,
          guild_id: message.guild.id,
        },
      })) !== null;

    if (!isReplyChannel) return;

    await Reply.create(
      {
        content: message.content,
        guild_id: message.guild.id,
        user_id: message.author.id,
      },
      {
        ignoreDuplicates: true,
      }
    );

    const reply = await Reply.findOne({
      order: seq.random(),
    });
    if (reply) {
      await message.channel.send(reply.content);
    }
  }
});

client.on('ready', () => {
  console.log('Bot is ready.');
});

async function init() {
  try {
    await seq.sync();
    console.log('Database is ready.');
    await client.login(config.token);
    console.log('Bot is logged in.');
  } catch (e) {
    console.error(e);
    return;
  }
}

init();
