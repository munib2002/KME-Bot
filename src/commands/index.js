import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import { COMMANDS } from '../constants/commands';

export const commands = [
    new SlashCommandBuilder()
        .setName(COMMANDS.MEMBER_STATS)
        .setDescription('Replies with member stats')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName(COMMANDS.FBAN)
        .setDescription('Fake Bans User')
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .toJSON(),
    new SlashCommandBuilder()
        .setName(COMMANDS.EMOTE)
        .setDescription('Copy Emote')
        
        .addStringOption(option => option.setName('emote').setDescription('The Emote to Copy').setRequired(true))
        // .addUserOption(option => option.setName('user').setDescription('The user to send the emote to').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .toJSON(),
];
