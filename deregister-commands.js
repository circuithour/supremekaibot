const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Deregistering Commands...');

        const commands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        for (const command of commands) {
            await rest.delete(
                Routes.applicationCommand(process.env.CLIENT_ID, command.id)
            );
        }

        console.log('Commands Deregistered');
    } catch (error) {
        console.log(`Error Occurred: ${error}`);
    }
})();
