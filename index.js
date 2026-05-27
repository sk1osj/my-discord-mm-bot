const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("MM Bot Online"));
app.listen(process.env.PORT || 3000);

require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const MM_CHANNEL = "1509120462356090890";

const panelSent = new Set();
const activeTickets = new Map();

client.once("clientReady", async () => {
  console.log("MM Bot Online");

  const channel = await client.channels.fetch(MM_CHANNEL).catch(() => null);
  if (!channel) return;

  if (panelSent.has(MM_CHANNEL)) return;
  panelSent.add(MM_CHANNEL);

  const embed = new EmbedBuilder()
    .setTitle("MM System")
    .setColor(0x2b2d31)
    .setDescription("Click the button below to start");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("start_mm")
      .setLabel("Start MM")
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ embeds: [embed], components: [row] });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "start_mm") {

    if (activeTickets.has(interaction.user.id)) {
      return interaction.reply({
        content: "You already have an open ticket.",
        ephemeral: true
      });
    }

    const guild = interaction.guild;

    const channel = await guild.channels.create({
      name: `mm-${interaction.user.username}`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    activeTickets.set(interaction.user.id, channel.id);

    const embed = new EmbedBuilder()
      .setTitle("MM Ticket")
      .setColor(0x2b2d31)
      .setDescription("Session started");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_mm")
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content: `Created: ${channel}`,
      ephemeral: true
    });
  }

  if (interaction.customId === "close_mm") {

    for (const [userId, channelId] of activeTickets) {
      if (channelId === interaction.channel.id) {
        activeTickets.delete(userId);
        break;
      }
    }

    await interaction.reply("Closing...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
});

client.login(process.env.TOKEN);
