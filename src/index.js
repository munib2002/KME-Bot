import { Client, GatewayIntentBits } from 'discord.js';
import moment from 'moment';

import { COMMANDS } from './constants/commands';
import { loadCommands } from './utils/discord.utils';

const { OWNER_ID } = process.env;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

const prefix = '.';

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

const main = async () => {
    await loadCommands();

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
            const userID = interaction.options.get('user')?.value;

            if (!userID) return await interaction.reply('Usage **/fban @user** to ban a user!');

            await interaction.reply(`<@${interaction.options.get('user').value}> has been banned from the server!`);
        }
    });

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);

        const command = args.shift().toLowerCase();

        if (command === 'va') {
            if (message.author.id !== OWNER_ID)
                return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

            // const validatedRoleId = '865990741754773534';
            const validatedRoleId = '1095363733750022197';

            const memberId = args[0]?.replace(/[<@!>]/g, '');

            if (!memberId)
                return await message.reply({
                    content: 'Usage **.va [user]** to validate a user!',
                    allowedMentions: { repliedUser: false },
                });

            const memberToValidate = message.guild.members.cache.get(memberId);

            if (!memberToValidate) return await message.reply({ content: 'User not found!', allowedMentions: { repliedUser: false } });

            if (memberToValidate.roles.cache.has(validatedRoleId))
                return await message.reply({ content: 'User already validated!', allowedMentions: { repliedUser: false } });

            try {
                await memberToValidate.roles.add(validatedRoleId);

                await message.reply({ content: `<@${memberId}> validated for Pickups!`, allowedMentions: { repliedUser: false } });
            } catch (e) {
                await message.reply({ content: 'Not enough permissions!', allowedMentions: { repliedUser: false } });
                console.log(e);
            }
        }
    });

    client.login(process.env.TOKEN);
};

main();
