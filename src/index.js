import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import moment from 'moment';
import ms from 'ms';
import util from 'util';

import { COMMANDS } from './constants/commands';
import { loadCommands } from './utils/discord.utils';
import { addRoleCommand } from './utils/role.utils';

const { OWNER_ID } = process.env;

const starRoleId = '1095679588740378624';
const adminRoleId = '1096354067850215544';
const moderatorRoleId = '1095361485221404765';

const queueChannelId = process.env.QUEUE_CHANNEL_ID || '1095360184559349820';
const validatedRoleId = process.env.VALIDATED_ROLE_ID || '1095363733750022197';
const blacklistedRoleId = process.env.BLACKLISTED_ROLE_ID || '1095640720456564736';
const htrRoleId = process.env.HTR_ROLE_ID || '1126526191671705600';
const inspectionRoleId = process.env.INSPECTION_ROLE_ID || '1119157862044807208';
const imagePermsRoleId = process.env.IMAGE_PERMS_ROLE_ID || '1103609890146095126';
const logsChannelId = process.env.LOGS_CHANNEL_ID || '1095639689383387159';

const devServerId = '826063908342595604';
const devLogsChannelId = '1124369895254147274';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

const prefix = '.';

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    console.log('Fetching all members...');
    await Promise.all(client.guilds.cache.map(async guild => await guild.members.fetch()));
    console.log('Fetched all members!');
});

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

            if (interaction.commandName === COMMANDS.EMOTE) {
                const emote = interaction.options.get('emote')?.value;

                console.log(emote);
            }
        } catch (e) {
            console.log(e);
        }
    });

    client.on('messageCreate', async message => {
        try {
            if (message.author.bot && message.author.id !== client.user.id) return;

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/g);

            const command = args.shift().toLowerCase();

            if (command === 'va') {
                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId) &&
                    message.author.id !== client.user.id
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                await addRoleCommand(message, args, validatedRoleId, {
                    main: {
                        title: 'Pickups Validation',
                        added: `{user} has been successfully validated for Pickups!\nHead over to <#${queueChannelId}> to play!`,
                    },
                    usage: '**.va [user]** to validate a user',
                    exists: '{user} is already validated',
                });
            }

            if (command === 'bl') {
                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId) &&
                    message.author.id !== client.user.id
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                await addRoleCommand(message, args, blacklistedRoleId, {
                    main: {
                        title: 'Blacklist',
                        added: '{user} has been blacklisted',
                    },
                    usage: '**.bl [user]** to blacklist a user',
                    exists: '{user} is already blacklisted',
                });
            }

            if (command === 'htr') {
                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId) &&
                    message.author.id !== client.user.id
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                await addRoleCommand(message, args, htrRoleId, {
                    main: {
                        title: 'Have To Record',
                        added: 'Added HTR role to {user}',
                    },
                    usage: '**.htr [user]** to add HTR role to a user',
                    exists: '{user} already has HTR role',
                });
            }

            if (command === 'img') {
                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId) &&
                    message.author.id !== client.user.id
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                await addRoleCommand(
                    message,
                    args,
                    imagePermsRoleId,
                    {
                        main: {
                            title: 'Image Permissions',
                            added: 'Added image permissions to {user}',
                            removed: 'Removed image permissions from {user}',
                        },
                        usage: '**.img [user]** to toggle image permissions for a user',
                    },
                    true,
                );
            }

            if (command === 'bvs') {
                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId) &&
                    message.author.id !== client.user.id
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                await addRoleCommand(
                    message,
                    args,
                    inspectionRoleId,
                    {
                        main: {
                            title: 'Inspection',
                            added: 'Added inspection role to {user}',
                            removed: 'Removed inspection role from {user}',
                        },
                        usage: '**.bvs [user]** to toggle inspection role for a user',
                    },
                    true,
                );
            }

            if (command === 'mute') {
                if (
                    message.author.id !== OWNER_ID &&
                    !message.member.roles.cache.has(adminRoleId) &&
                    !message.member.roles.cache.has(moderatorRoleId) &&
                    !message.member.roles.cache.has(starRoleId) &&
                    message.author.id !== client.user.id
                )
                    return await message.reply({ content: 'No! :smiling_imp:', allowedMentions: { repliedUser: false } });

                const embed = new EmbedBuilder().setTitle('Mute').setColor('#18ffff');

                const memberId = args[0]?.replace(/[<@!>]/g, '');
                const duration = args[1];
                const reason = args.slice(2).join(' ') || 'No Reason Provided';

                if (!memberId) {
                    embed.setTitle('Usage').setDescription('**.mute [user] [duration] [reason]** to mute a user').setColor('#F08A5D');

                    return await message.channel.send({ embeds: [embed] });
                }

                const member = message.guild.members.cache.get(memberId);

                if (!member) {
                    embed.setDescription('User not found!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                if (!duration) {
                    embed.setDescription('Duration Not Specified!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                if (!duration.match(/^[1-9][0-9]*[dhms]$/i) || !ms(duration)) {
                    embed.setDescription('Invalid Duration!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                try {
                    if (!member.moderatable) {
                        embed.setDescription('I cannot mute this user!').setColor('#ff1744');

                        return await message.channel.send({ embeds: [embed] });
                    }

                    await message.delete().catch(console.error);

                    await member.timeout(ms(duration), reason);

                    embed
                        .setDescription(`Muted <@${memberId}> for ${ms(ms(duration), { long: true })}!`)
                        .addFields({ name: 'Reason', value: reason })
                        .setColor('#18ffff');

                    await message.channel.send({ embeds: [embed] });

                    const logsChannel = message.guild.channels.cache.get(logsChannelId);

                    const logsEmbed = new EmbedBuilder()
                        .setTitle('Mute')
                        .setDescription(`Muted <@${memberId}> for ${ms(ms(duration), { long: true })}!`)
                        .addFields(
                            { name: 'Reason', value: reason, inline: true },
                            { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                        )
                        .setColor('#18ffff');

                    if (logsChannel) {
                        await logsChannel.send({ embeds: [logsEmbed] }).catch(console.error);
                    }

                    const devServer = client.guilds.cache.get(devServerId);
                    const devLogsChannel = devServer.channels.cache.get(devLogsChannelId);

                    devLogsChannel.send({ embeds: [logsEmbed] }).catch(console.error);
                } catch (e) {
                    embed.setDescription(`Something went wrong! Contact <@${process.env.OWNER_ID}> for Help`).setColor('#ff1744');

                    await message.channel.send({ embeds: [embed] });

                    console.log(e);
                }
            }

            if (command === 'say') {
                if (message.author.id !== OWNER_ID && message.author.id !== '735800926501208064') return;

                const embed = new EmbedBuilder().setTitle('Say').setColor('#18ffff');

                const channelId = args[0]?.replace(/[<#>]/g, '') === '.' ? queueChannelId : args[0]?.replace(/[<#>]/g, '');
                const content = args.slice(1).join(' ');

                if (!channelId || !content) {
                    embed
                        .setTitle('Usage')
                        .setDescription('**.say [channel] [content]** to send a message to a channel')
                        .setColor('#F08A5D');

                    return await message.channel.send({ embeds: [embed] });
                }

                const channel = client.channels.cache.get(channelId);

                if (!channel) {
                    embed.setDescription('Channel not found!').setColor('#ff1744');

                    return await message.channel.send({ embeds: [embed] });
                }

                try {
                    await channel.send(content);

                    embed.setDescription(`Sent message to <#${channelId}>`).setColor('#18ffff');

                    await message.channel.send({ embeds: [embed] });
                } catch (e) {
                    embed.setDescription(`Something went wrong! Contact <@${process.env.OWNER_ID}> for Help`).setColor('#ff1744');

                    await message.channel.send({ embeds: [embed] });

                    console.log(e);
                }
            }

            if (command === 'c_emoji') {
                // if (message.author.id !== OWNER_ID && message.author.id !== '735800926501208064') return;
                // const embed = new EmbedBuilder().setTitle('Custom Emoji').setColor('#18ffff');
                // const guildId = args[0] === '.' ? message.guild.id : args[0];
                // const emojis = [];
                // let emojisToParse = args.slice(1).filter(c => (/^<a?:.+?:\d+?>$/.test(c) ? emojis.push(c) && false : true));
                // if (!guildId) {
                //     embed
                //         .setTitle('Usage')
                //         .setDescription('**.c_emoji [guildId] [emoji_1] [emoji_2]...** to create custom emojis')
                //         .setColor('#F08A5D');
                //     return await message.channel.send({ embeds: [embed] });
                // }
                // try {
                //     for (const emojiToParse of emojisToParse) {
                //         if (!/^:.+?:$/.test(emojiToParse)) continue;
                //         const emojiName = emojiToParse.split(':')[1];
                //         const emoji = client.emojis.cache.find(c => {
                //             if (c.name === emojiName) return c;
                //         });
                //         const emojiBuffer = await (await fetch(emojiUrl)).buffer();
                //         const emojiCreated = await client.guilds.cache.get(guildId).emojis.create(emojiBuffer, emojiName);
                //         emojisToParse = emojisToParse.filter(c => c !== emojiToParse);
                //         emojisToParse.push(`<:${emojiName}:${emojiCreated.id}>`);
                //     }
                //     console.log(emojisToParse);
                // } catch (e) {
                //     embed.setDescription(`Something went wrong! Contact <@${process.env.OWNER_ID}> for Help`).setColor('#ff1744');
                //     await message.channel.send({ embeds: [embed] });
                //     console.log(e);
                // }
            }

            if (command === 'code') {
                if (message.author.id !== OWNER_ID) return;

                const code = message.content.slice(5).trim();

                try {
                    let result = await eval(code);

                    if (typeof result !== 'string') {
                        result = util.inspect(result, { depth: 0 });
                    }

                    if (result.length > 1900) result = result.slice(0, 1900) + '...';

                    await message.channel.send('```js\n' + result + '\n```');
                } catch (e) {
                    await message.channel.send('```js\n' + JSON.stringify({ message: e?.message, error: e.toString() }) + '\n```');
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    client.login(process.env.TOKEN);
};

main().catch(e => console.log(e));
