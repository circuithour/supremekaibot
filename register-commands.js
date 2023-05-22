const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

const commands = [
    {
        name: 'ping',
        description: 'Replies with pong'
    },
    {
        name: 'birdy',
        description: 'Enables hourly bird messages in the channel.'
    },
    {
        name: 'unbirdy',
        description: 'Disables hourly bird messages in the channel.'
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Registering Commands...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('Commands Registered');
    } catch (error) {
        console.log(`Error Occurred: ${error}`);
    }
})();
