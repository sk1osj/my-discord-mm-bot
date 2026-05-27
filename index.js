const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive");
});

app.listen(process.env.PORT || 3000);

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async () => {
  console.log("MM Bot Online");

  const channel = await client.channels.fetch("1509120462356090890").catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("Middleman Service")
    .setColor(0x2b2d31)
    .setDescription(`
Middleman System

Fees:
$250+ -> $1.50
$50 - $250 -> $0.50
Under $50 -> FREE

Press the button to open MM ticket
`);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_mm")
      .setLabel("Open Middleman")
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ embeds: [embed], components: [row] });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "open_mm") {
    const channel = await interaction.guild.channels.create({
      name: `mm-${interaction.user.username}`,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
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

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_mm")
        .setLabel("Close MM")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `Middleman started for ${interaction.user}`,
      components: [row]
    });

    return interaction.reply({
      content: `MM ticket created: ${channel}`,
      ephemeral: true
    });
  }

  if (interaction.customId === "close_mm") {
    await interaction.reply("Closing MM...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
});

client.login(process.env.TOKEN);
