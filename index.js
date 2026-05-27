const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("kdkwow MM Bot Online"));
app.listen(process.env.PORT || 3000);

require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
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

client.once("ready", async () => {
  console.log("MM Bot Online");

  const channel = await client.channels.fetch(MM_CHANNEL).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("kdkwow MM System")
    .setColor(0x2b2d31)
    .setDescription("Click the button to start MM request");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("start_mm")
      .setLabel("Start MM")
      .setStyle(ButtonStyle.Success)
  );

  channel.send({ embeds: [embed], components: [row] });
});

const deals = new Map();

client.on(Events.InteractionCreate, async (interaction) => {

  // OPEN FORM
  if (interaction.isButton() && interaction.customId === "start_mm") {

    const modal = new ModalBuilder()
      .setCustomId("mm_form")
      .setTitle("Middleman Form");

    const trader = new TextInputBuilder()
      .setCustomId("trader")
      .setLabel("Trader ID / Username")
      .setStyle(TextInputStyle.Short);

    const amount = new TextInputBuilder()
      .setCustomId("amount")
      .setLabel("Amount ($)")
      .setStyle(TextInputStyle.Short);

    const item = new TextInputBuilder()
      .setCustomId("item")
      .setLabel("What is being traded?")
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder().addComponents(trader),
      new ActionRowBuilder().addComponents(amount),
      new ActionRowBuilder().addComponents(item)
    );

    return interaction.showModal(modal);
  }

  // SUBMIT FORM
  if (interaction.isModalSubmit() && interaction.customId === "mm_form") {

    const trader = interaction.fields.getTextInputValue("trader");
    const amount = parseFloat(interaction.fields.getTextInputValue("amount")) || 0;
    const item = interaction.fields.getTextInputValue("item");

    let fee = 0;
    if (amount < 50) fee = 0;
    else if (amount < 250) fee = 0.5;
    else fee = 1.5;

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
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    deals.set(channel.id, { trader, amount, item, fee });

    const embed = new EmbedBuilder()
      .setTitle("MM DEAL CREATED")
      .setColor(0x2b2d31)
      .addFields(
        { name: "Trader", value: trader },
        { name: "Amount", value: `$${amount}` },
        { name: "Item", value: item },
        { name: "Fee", value: `$${fee}` }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_mm")
        .setLabel("Close MM")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content: `MM created: ${channel}`,
      ephemeral: true
    });
  }

  // CLOSE MM
  if (interaction.isButton() && interaction.customId === "close_mm") {

    deals.delete(interaction.channel.id);

    await interaction.reply("Closing MM...");
    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }
});

client.login(process.env.TOKEN);
