import { REST, Routes, Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import moment from 'moment';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

const main = async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('member-stats')
            .setDescription('Replies with member stats!')
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .toJSON(),
        new SlashCommandBuilder()
            .setName('fban')
            .setDescription('Replies with member stats!')
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .toJSON(),
    ];

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    let members;

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'member-stats') {
            if (interaction.user.id !== '543805299090522112') {
                return await interaction.reply(
                    'You are not Strong enough to use this command. The only one worthy is <@543805299090522112>. :smiling_imp:',
                );
            }
            try {
                await interaction.deferReply({ ephemeral: false });

                members = (await interaction.guild.members.fetch()).filter(c => !c.user.bot);

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
                console.log(e);
            }
        }

        if (interaction.commandName === 'fban') {
            
            await interaction.reply('Its Not Ready yet!!!!!!!!! :punch:');
        }
    });

    client.login(process.env.TOKEN);
};

main();
