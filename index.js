import { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🍯 Honeypot channel: ${config.honeypotChannelId}`);
});

client.on('messageCreate', async (message) => {
  // Ignore DMs and own messages
  if (!message.guild || message.author.bot) return;

  // Only trigger on honeypot channel
  if (message.channel.id !== config.honeypotChannelId) return;

  // Ignore admins/mods (optional — remove if you want to catch everyone)
  if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

  const member = message.member;
  const triggeredAt = new Date();

  // Build log embed
  const embed = new EmbedBuilder()
    .setTitle('🍯 Honeypot Triggered')
    .setColor(0xff0000)
    .addFields(
      { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
      { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
      { name: 'Content', value: message.content || '*[no text]*' },
    )
    .setTimestamp(triggeredAt);

  // Send to log channel
  try {
    const logChannel = await client.channels.fetch(config.logChannelId);
    if (logChannel?.isTextBased()) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Failed to log:', err);
  }

  // DM the user
  if (config.dmUser) {
    try {
      await member.send(config.dmMessage).catch(() => {});
    } catch {}
  }

  // Punish
  try {
    if (config.punishment === 'ban') {
      await member.ban({ reason: 'Triggered honeypot channel' });
    } else if (config.punishment === 'kick') {
      await member.kick('Triggered honeypot channel');
    } else if (config.punishment === 'timeout') {
      await member.timeout(config.timeoutDurationMs, 'Triggered honeypot channel');
    }
    console.log(`Punished ${member.user.tag} (${config.punishment})`);
  } catch (err) {
    console.error('Failed to punish:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);
