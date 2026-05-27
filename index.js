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

client.once("ready", () => {
  console.log("MM Bot Online");

  // 🔥 שים כאן את ה-Channel ID שלך
  const channel = client.channels.cache.get("PUT_CHANNEL_ID_HERE");

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🤝 Middleman Service")
    .setColor(0x2b2d31)
    .setDescription(`
💰 Fees:
$250+ → $1.50
under $250 → $0.50
under $50 → FREE

🎫 Press the button below to open a ticket
    `);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Open Ticket")
      .setStyle(ButtonStyle.Success)
  );

  channel.send({ embeds: [embed], components: [row] });
});

// 🎛️ BUTTON SYSTEM
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  // OPEN TICKET
  if (interaction.customId === "open_ticket") {

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("❌ Close")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `Welcome ${interaction.user}`,
      components: [row]
    });

    return interaction.reply({
      content: `Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  // CLOSE TICKET
  if (interaction.customId === "close_ticket") {
    await interaction.reply("Closing ticket...");
    setTimeout(() => interaction.channel.delete(), 2000);
  }
});

client.login(process.env.TOKEN);
