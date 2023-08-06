import { EmbedBuilder } from 'discord.js';

export const addRoleCommand = async (message, args, roleId, { main, usage, exists }, toggleAble = false) => {
    const embed = new EmbedBuilder().setTitle(main.title).setColor('#18ffff');

    const memberId = args[0]?.replace(/[<@!>]/g, '');

    if (!memberId) {
        embed.setTitle('Usage').setDescription(usage).setColor('#F08A5D');

        return await message.channel.send({ embeds: [embed] });
    }

    const memberToValidate = message.guild.members.cache.get(memberId);

    if (!memberToValidate) {
        embed.setDescription('User not found!').setColor('#ff1744');

        return await message.channel.send({ embeds: [embed] });
    }

    if (!toggleAble && memberToValidate.roles.cache.has(roleId)) {
        embed.setDescription(exists.replace('{user}', `<@${memberId}>`));

        return await message.channel.send({ embeds: [embed] });
    }

    try {
        if (memberToValidate.roles.cache.has(roleId)) {
            await memberToValidate.roles.remove(roleId);

            embed.setDescription(main.removed.replace('{user}', `<@${memberId}>`));
        } else {
            await memberToValidate.roles.add(roleId);

            embed.setDescription(main.added.replace('{user}', `<@${memberId}>`));
        }

        await message.channel.send({ embeds: [embed] });
    } catch (e) {
        embed.setDescription(`Something went wrong! Contact <@${process.env.OWNER_ID}> for Help`).setColor('#ff1744');

        await message.channel.send({ embeds: [embed] });

        console.log(e);
    }
};
