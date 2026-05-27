const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("clientReady", () => {
  console.log("MM Bot Online");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // 🎛️ MM PANEL
  if (message.content === "!mm") {

    const embed = new EmbedBuilder()
      .setTitle("kdkwow mm")
      .setColor(0x2b2d31)
      .setDescription(`
> **Auto Middleman Service**

💰 Fees:
- $250+ → $1.50
- under $250 → $0.50
- under $50 → FREE

💳 Payments:
- Litecoin (LTC)
- USDT (BEP20)

⚠️ Read ToS before using service
      `);

    return message.channel.send({ embeds: [embed] });
  }

  // 🤝 DEAL SYSTEM (רמה בסיסית)
  if (message.content.startsWith("!deal")) {

    const args = message.content.split(" ");

    const buyer = args[1] || "N/A";
    const seller = args[2] || "N/A";

    message.channel.send(`
🤝 **New MM Deal**

👤 Buyer: ${buyer}
👤 Seller: ${seller}
📊 Status: Pending
    `);
  }

});

client.login(process.env.TOKEN);
