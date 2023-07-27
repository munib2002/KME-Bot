import { Client, GatewayIntentBits } from 'discord.js';
import moment from 'moment';

import { COMMANDS } from './constants/commands';
import { loadCommands } from './utils/discord.utils';

const { OWNER_ID } = process.env;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

const main = async () => {
    await loadCommands();

    let msg;

    setInterval(async () => {
        if (msg) {
            await msg.delete();
        }

        msg = await (await client.users.fetch(OWNER_ID)).send('Bot is up and running!');
    }, 1000 * 60 * 10);

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === COMMANDS.MEMBER_STATS) {
            try {
                if (interaction.user.id !== OWNER_ID) {
                    return await interaction.reply(
                        `You are not Strong enough to use this command. The only one worthy is <@${OWNER_ID}>. :smiling_imp:`,
                    );
                }

                await interaction.deferReply({ ephemeral: false });

                let members = (await interaction.guild.members.fetch()).filter(c => !c.user.bot);

                const alts = members.filter(c => moment().diff(moment(c.user.createdAt), 'days') < 60);

                // const validated = alts.filter(c => c.roles.cache.has('865990741754773534'));
                const validated = alts.filter(c => c.roles.cache.has('1095363733750022197'));

                await interaction.followUp(`Total Members: ${members.size}`);
                await interaction.followUp(
                    `Alts Count: ${alts.size}\nValidated Alts Count: ${validated.size}\n\nValidated Alts: ${validated
                        .map(c => `<@${c.id}>`)
                        .join('  ')}\n\nUnValidated Alts: ${alts
                        .filter(c => !c.roles.cache.has('1095363733750022197'))
                        .map(c => `<@${c.id}>`)
                        .join('  ')}`,
                );
            } catch (e) {
                await interaction.followUp('Something went wrong!');

                console.log(e);
            }
        }

        if (interaction.commandName === COMMANDS.FBAN) {
            await interaction.reply('Its Not Ready yet!!!!!!!!! :punch:');
        }
    });

    client.login(process.env.TOKEN);
};

main();
