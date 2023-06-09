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
    {
        name: 'kitty',
        description: 'Enables hourly cat messages in the channel.'
    },
    {
        name: 'unkitty',
        description: 'Disables hourly cat messages in the channel.'
    },
    {
        name: 'bird',
        description: 'Sends a picture of a bird.'
    },
    {
        name: 'manualbird',
        description: 'Sends a message to all bird channels. Only available to @daisybirdy',
        options: [
            {
                name: 'message',
                description: 'The message to send',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'fox',
        description: 'Sends a picture of a fox.'
    },
    {
        name: 'cat',
        description: 'Sends a picture of a cat.'
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
