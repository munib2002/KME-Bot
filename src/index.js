import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import moment from 'moment';

import { COMMANDS } from './constants/commands';
import { loadCommands } from './utils/discord.utils';

const { OWNER_ID } = process.env;

const starRoleId = '1095679588740378624';
const adminRoleId = '1096354067850215544';
const moderatorRoleId = '1095361485221404765';

const queueChannelId = process.env.QUEUE_CHANNEL_ID || '1095360184559349820';
const validatedRoleId = process.env.VALIDATED_ROLE_ID || '1095363733750022197';
const blacklistedRoleId = process.env.BLACKLISTED_ROLE_ID || '1095640720456564736';
const inspectionRoleId = process.env.INSPECTION_ROLE_ID || '1119157862044807208';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

const prefix = '.';

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

const main = async () => {
    await loadCommands();

    client.on('interactionCreate', async interaction => {
        try {
            if (!interaction.isChatInputCommand()) return;

            if (interaction.commandName === COMMANDS.MEMBER_STATS) {
                try {
                    if (interaction.user.id !== OWNER_ID) {
                        return await interaction.reply(`Not Ready Yet. Ask <@${OWNER_ID}> for more info!`);
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
        } catch (e) {
            console.log(e);
        }
    });

    client.on('messageCreate', async message => {
        try {
            if (message.author.bot) return;

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/g);

            const command = args.shift().toLowerCase();

            if (command === 'va') {
                const embed = new EmbedBuilder().setTitle('Pickups Validation').setColor('#18ffff');

                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId)
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                const memberId = args[0]?.replace(/[<@!>]/g, '');

                if (!memberId) {
                    embed.setTitle('Usage').setDescription('**.va [user]** to validate a user').setColor('#F08A5D');

                    return await message.channel.send({ embeds: [embed] });
                }

                const memberToValidate = message.guild.members.cache.get(memberId);

                if (!memberToValidate) {
                    embed.setDescription('User not found!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                if (memberToValidate.roles.cache.has(validatedRoleId)) {
                    embed.setDescription(`<@${memberId}> is already validated`);

                    return await message.channel.send({ embeds: [embed] });
                }

                try {
                    await memberToValidate.roles.add(validatedRoleId);

                    embed.setDescription(
                        `<@${memberId}> has been successfully validated for Pickups!\nHead over to <#${queueChannelId}> to play!`,
                    );

                    await message.channel.send({ embeds: [embed] });
                } catch (e) {
                    embed.setDescription(`Something went wrong! Contact <@${OWNER_ID}> for Help`).setColor('#ff1744');

                    await message.channel.send({ embeds: [embed] });

                    console.log(e);
                }
            }

            if (command === 'bl') {
                const embed = new EmbedBuilder().setTitle('Blacklist').setColor('#18ffff');

                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId)
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                const memberId = args[0]?.replace(/[<@!>]/g, '');

                if (!memberId) {
                    embed.setTitle('Usage').setDescription('**.bl [user]** to blacklist a user').setColor('#F08A5D');

                    return await message.channel.send({ embeds: [embed] });
                }

                const memberToValidate = message.guild.members.cache.get(memberId);

                if (!memberToValidate) {
                    embed.setDescription('User not found!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                if (memberToValidate.roles.cache.has(blacklistedRoleId)) {
                    embed.setDescription(`<@${memberId}> is already blacklisted`);

                    return await message.channel.send({ embeds: [embed] });
                }

                try {
                    await memberToValidate.roles.add(blacklistedRoleId);

                    embed.setDescription(`<@${memberId}> blacklisted`);

                    await message.channel.send({ embeds: [embed] });
                } catch (e) {
                    embed.setDescription(`Something went wrong! Contact <@${OWNER_ID}> for Help`).setColor('#ff1744');

                    await message.channel.send({ embeds: [embed] });

                    console.log(e);
                }
            }

            if (command === 'bvs') {
                const embed = new EmbedBuilder().setTitle('Inspection').setColor('#18ffff');

                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId)
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                const memberId = args[0]?.replace(/[<@!>]/g, '');
                const option = args[1] || '+';

                if (!memberId || !['+', '-'].includes(option)) {
                    embed
                        .setTitle('Usage')
                        .setDescription(
                            '**.bvs [user] [action]** to add or remove inspection role\n\n**Actions:** [**+** or **-**]\n**Default:** +',
                        )
                        .setColor('#F08A5D');

                    return await message.channel.send({ embeds: [embed] });
                }

                const memberToValidate = message.guild.members.cache.get(memberId);

                if (!memberToValidate) {
                    embed.setDescription('User not found!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                if (memberToValidate.roles.cache.has(inspectionRoleId) && option === '+') {
                    embed.setDescription(`<@${memberId}> already has inspection role`);

                    return await message.channel.send({ embeds: [embed] });
                }

                if (!memberToValidate.roles.cache.has(inspectionRoleId) && option === '-') {
                    embed.setDescription(`<@${memberId}> doesn't have inspection role`);

                    return await message.channel.send({ embeds: [embed] });
                }

                try {
                    if (option === '+') {
                        await memberToValidate.roles.add(inspectionRoleId);

                        embed.setDescription(`Added inspection role to <@${memberId}>`);
                    } else {
                        await memberToValidate.roles.remove(inspectionRoleId);

                        embed.setDescription(`Removed inspection role from <@${memberId}>`);
                    }

                    await message.channel.send({ embeds: [embed] });
                } catch (e) {
                    embed.setDescription(`Something went wrong! Contact <@${OWNER_ID}> for Help`).setColor('#ff1744');

                    await message.channel.send({ embeds: [embed] });

                    console.log(e);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    client.login(process.env.TOKEN);
};

main();
