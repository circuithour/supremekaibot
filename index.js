const fs = require('fs');
const fetch = require('node-fetch').default;
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

const birdUrl = 'https://api.tail.cafe/image/bird';
const foxUrl = 'https://api.tail.cafe/image/fox';

require('dotenv').config();

// Bot Boot
client.on('ready', () => {
  console.log('Bot Online!');
  client.user.setPresence({
    activities: [{ name: `Universe 7`, type: ActivityType.Watching }],
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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

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
        interaction.reply('This channel is not subscribed to birds.');
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

  //bird
  if (interaction.commandName === 'bird') {
    sendBird(interaction, birdUrl);
  }

  //fox
  if (interaction.commandName === 'fox') {
    sendFox(interaction, foxUrl);
  }
});

// Send a bird image to the server
async function sendBird(interaction, url) {
  try {
    const bird = await fetch(url);
    const birdJson = await bird.json();

    if (!birdJson.image) {
      console.error('Empty bird image URL received.');
      interaction.reply('Uh oh, birdy flew away.');
      return;
    }

    interaction.reply({ content: birdJson.image, ephemeral: false });
  } catch (error) {
    console.error('Failed to send bird image:', error);
    interaction.reply('Uh oh, birdy flew away.');
  }
}

// Send a fox image to the server
async function sendFox(interaction, url) {
  try {
    const fox = await fetch(url);
    const foxJson = await fox.json();

    if (!foxJson.image) {
      console.error('Empty fox image URL received.');
      interaction.reply('Uh oh, the fox ran away.');
      return;
    }

    interaction.reply({ content: foxJson.image, ephemeral: false });
  } catch (error) {
    console.error('Failed to send fox image:', error);
    interaction.reply('Uh oh, the fox ran away.');
  }
}

// Send bird images to subscribed channels
async function sendBirds() {
  fs.readFile('channelIDs.json', 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading channelIDs.json:', err);
      return;
    }

    const channelIDs = JSON.parse(data);
    const bird = await fetch(birdUrl);
    const birdJson = await bird.json();

    channelIDs.forEach((channelID) => {
      const channel = client.channels.cache.get(channelID);
      if (!channel) {
        console.error(`Channel ID ${channelID} not found.`);
        return;
      }

      channel.send(birdJson.image)
        .then(() => console.log(`Bird image sent to channel ${channelID}`))
        .catch((error) => console.error(`Failed to send bird image to channel ${channelID}:`, error));
    });
  });
}

client.login(process.env.BOT_TOKEN);