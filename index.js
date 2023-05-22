const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const client = new Client({
  shardCount: 2,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

require('dotenv').config();

// Bot Boot
client.on('ready', () => {
  console.log('Bot Online!');
  client.user.setPresence({
    activities: [{ name: `Summer Olympics`, type: ActivityType.Competing }],
    status: 'online',
  });

  // On The Hour Every Hour
  const time = new Date().getTime() % 3600000;
  const remaining = 3600000 - time;
  setTimeout(() => {
    sendBirds();
    setInterval(sendBirds, 3600000);
  }, remaining);

});



// New Commands

client.on('interactionCreate', (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  //ping
  if (interaction.commandName === 'ping') {
    const startTime = Date.now();
    interaction.reply('Pinging...').then((sentMessage) => {
      const endTime = Date.now();
      const pingTime = endTime - startTime;
      const botLatency = client.ws.ping;
      sentMessage.edit(`Pong! Latency: ${pingTime}ms | API Latency: ${botLatency}ms`);
    }).catch((error) => {
      console.error('Failed to reply to the interaction:', error);
    });
  }

  //birdy
  if (interaction.commandName === 'birdy') {
    const channelID = interaction.channelId;

    fs.readFile('channelIDs.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading channelIDs.json:', err);
        return;
      }

      let channelIDs = JSON.parse(data);

      if (channelIDs.includes(channelID)) {
        interaction.reply('This channel is already subscribed to birds.');
        return;
      }

      channelIDs.push(channelID);

      fs.writeFile('channelIDs.json', JSON.stringify(channelIDs), (err) => {
        if (err) {
          console.error('Error writing channelIDs.json:', err);
          return;
        }

        console.log(`Channel ID ${channelID} added to channelIDs.json`);

        interaction.reply(`This channel has been subscribed to birds. You may use /unbirdy to opt out.`);
      });
    });
  }

  //unbirdy
  if (interaction.commandName === 'unbirdy') {
    const channelID = interaction.channelId;

    fs.readFile('channelIDs.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading channelIDs.json:', err);
        return;
      }

      let channelIDs = JSON.parse(data);

      if (!channelIDs.includes(channelID)) {
        interaction.reply('This channel is not currently subscribed to birds.');
        return;
      }

      channelIDs = channelIDs.filter((id) => id !== channelID);

      fs.writeFile('channelIDs.json', JSON.stringify(channelIDs), (err) => {
        if (err) {
          console.error('Error writing channelIDs.json:', err);
          return;
        }

        console.log(`Channel ID ${channelID} removed from channelIDs.json`);

        interaction.reply(`You have successfully removed birds from this channel.`);
      });
    });
  }


});

/* Commands
client.on('messageCreate', async (message) => {
  switch (message.content.toLowerCase().trim()) {
    // ping
    case '~ping':
      const startTime = Date.now(); // Capture the current timestamp
      const reply = await message.channel.send('Pinging...');
      const endTime = Date.now(); // Capture the timestamp after sending the initial message
      const pingTime = endTime - startTime; // Calculate the difference in milliseconds

      reply.edit(`Pong, took ${pingTime}ms`);
      break;

    // ping2
    case '~ping2':
      await message.channel.send(`Latency is ${client.ws.ping}ms`);
      break;

    // shard
    case '~shard':
      const shardCount = client.shard.count;
      await message.channel.send(`There are ${shardCount} shards.`);
      break;
  }
});*/

client.login(process.env.BOT_TOKEN);
