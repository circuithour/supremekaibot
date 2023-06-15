const fs = require('fs');
const fetch = require('node-fetch').default;
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const client = new Client({
  shardCount: 2,
  intents: [
    'Guilds'
  ],
});

const birdUrl = 'https://api.tail.cafe/image/bird';
const foxUrl = 'https://api.tail.cafe/image/fox';
const catUrl = 'https://cataas.com/cat?json=true';

require('dotenv').config();

if (!fs.existsSync('channelIDs.json')) {
  fs.writeFileSync('channelIDs.json', '[]');
}

if (!fs.existsSync('catchannelIDs.json')) {
  fs.writeFileSync('catchannelIDs.json', '[]');
}

// Bot Boot
client.on('ready', () => {
  console.log('Bot Online!');
  client.user.setPresence({
    activities: [{ name: `With Wind`, type: ActivityType.Playing }],
    status: 'online',
  });

  // On The Hour Every Hour
  const time = new Date().getTime() % 3600000;
  const remaining = 3600000 - time;
  setTimeout(() => {
    sendBirds();
    sendCats();
    setInterval(() => {
      sendBirds();
      sendCats();
    }, 3600000);
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

  // manualbird
  if (interaction.commandName === 'manualbird') {
    const userID = interaction.user.id;
    if (userID !== process.env.OWNER_ID) {
      interaction.reply('You are not authorized to use this command.');
      return;
    }

    const messageOption = interaction.options.getString('message');
    if (!messageOption) {
      interaction.reply('Please provide a message to send.');
      return;
    }

    const message = messageOption;

    fs.readFile('channelIDs.json', 'utf8', async (err, data) => {
      if (err) {
        console.error('Error reading channelIDs.json:', err);
        return;
      }

      const channelIDs = JSON.parse(data);

      const promises = channelIDs.map(async (channelID) => {
        try {
          const channel = await client.channels.fetch(channelID);
          if (!channel) {
            console.error(`Channel ID ${channelID} not found.`);
            return;
          }

          await channel.send(message);
          console.log(`Message sent to channel ${channelID}`);
        } catch (error) {
          console.error(`Failed to send message to channel ${channelID}:`, error);
        }
      });

      await Promise.all(promises);

      interaction.reply(`The message "${message}" has been sent to all channels subscribed to birds.`);
    });
  }

  // kitty
  if (interaction.commandName === 'kitty') {
    const channelID = interaction.channelId;

    fs.readFile('catchannelIDs.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading catchannelIDs.json:', err);
        return;
      }

      let catchannelIDs = JSON.parse(data);

      if (catchannelIDs.includes(channelID)) {
        interaction.reply('This channel is already subscribed to cats.');
        return;
      }

      catchannelIDs.push(channelID);

      fs.writeFile('catchannelIDs.json', JSON.stringify(catchannelIDs), (err) => {
        if (err) {
          console.error('Error writing catchannelIDs.json:', err);
          return;
        }

        console.log(`Channel ID ${channelID} added to catchannelIDs.json`);

        interaction.reply(`This channel has been subscribed to cats. You may use /unkitty to opt out.`);
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

  //unkitty
  if (interaction.commandName === 'unkitty') {
    const channelID = interaction.channelId;

    fs.readFile('catchannelIDs.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading catchannelIDs.json:', err);
        return;
      }

      let catchannelIDs = JSON.parse(data);

      if (!catchannelIDs.includes(channelID)) {
        interaction.reply('This channel is not subscribed to cats.');
        return;
      }

      catchannelIDs = catchannelIDs.filter((id) => id !== channelID);

      fs.writeFile('channelIDs.json', JSON.stringify(catchannelIDs), (err) => {
        if (err) {
          console.error('Error writing catchannelIDs.json:', err);
          return;
        }

        console.log(`Channel ID ${channelID} removed from catchannelIDs.json`);

        interaction.reply(`You have successfully removed cats from this channel.`);
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

  //cat
  if (interaction.commandName === 'cat') {
    sendCat(interaction, catUrl);
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

// Send a cat image to the server
async function sendCat(interaction, url) {
  try {
    const catResponse = await fetch(url);
    const catJson = await catResponse.json();

    if (!catJson.url) {
      console.error('Empty cat image URL received.');
      interaction.reply('Uh oh, the cat went missing.');
      return;
    }

    const catImageUrl = new URL(catJson.url, url).href;
    const imageResponse = await fetch(catImageUrl);
    const buffer = await imageResponse.buffer();
    const fileSize = Buffer.byteLength(buffer);

    if (fileSize === 0) {
      console.error('Empty cat image received.');
      interaction.reply('Uh oh, the cat went missing.');
      return;
    }

    interaction.reply({ files: [buffer], ephemeral: false });
  } catch (error) {
    console.error('Failed to send cat image:', error);
    interaction.reply('Uh oh, the cat went missing.');
  }
}


// Send bird images to subscribed channels
async function sendBirds() {
  const channelIDs = require('./channelIDs.json');
  const bird = await fetch(birdUrl);
  const birdJson = await bird.json();

  if (!('image' in birdJson)) {
    console.error('Empty bird image URL received.');
    return;
  }

  const birdImageUrl = birdJson.image;

  channelIDs.forEach((channelID) => {
    const channel = client.channels.cache.get(channelID);
    if (!channel) {
      console.error(`Channel ID ${channelID} not found.`);
      return;
    }

    channel.send(birdImageUrl)
      .then(() => console.log(`Bird image sent to channel ${channelID}`))
      .catch((error) => console.error(`Failed to send bird image to channel ${channelID}:`, error));
  });
}

// Send cat images to subscribed channels
async function sendCats() {
  const catchannelIDs = require('./catchannelIDs.json');
  const catResponse = await fetch(catUrl);
  const catJson = await catResponse.json();

  if (!('url' in catJson)) {
    console.error('Empty cat image URL received.');
    return;
  }

  const catImageUrl = new URL(catJson.url, catUrl).href;

  catchannelIDs.forEach((channelID) => {
    const channel = client.channels.cache.get(channelID);
    if (!channel) {
      console.error(`Channel ID ${channelID} not found.`);
      return;
    }

    channel.send(catImageUrl)
      .then(() => console.log(`Cat image sent to channel ${channelID}`))
      .catch((error) => console.error(`Failed to send cat image to channel ${channelID}:`, error));
  });
}

client.login(process.env.BOT_TOKEN);
