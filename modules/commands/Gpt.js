const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "gpt",
    aliases: [],
    version: "1.0.0",
    description: "AI Image Generator and Editor (Reply to an image to edit it)",
    usage: "{prefix}gpt [prompt] or reply to an image",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, messageReply } = message;

    try {
      const prompt = args.join(" ");
      let imageUrl = "";

      // Check if user replied to an image
      if (messageReply && messageReply.attachments && messageReply.attachments[0]?.type === "photo") {
        imageUrl = messageReply.attachments[0].url;
      }

      if (!prompt && !imageUrl) {
        return api.sendMessage("❌ Please provide a prompt or reply to an image with a prompt.", threadID, messageID);
      }

      api.setMessageReaction("⏳", messageID, () => {}, true);

      // Construct API URL
      const apiUrl = imageUrl
        ? `https://xalman-apis.vercel.app/api/gptimg?prompt=${encodeURIComponent(prompt)}&image_url=${encodeURIComponent(imageUrl)}`
        : `https://xalman-apis.vercel.app/api/gptimg?prompt=${encodeURIComponent(prompt)}`;

      const response = await axios({
        url: apiUrl,
        method: "GET",
        responseType: "arraybuffer"
      });

      // Create cache directory if it doesn't exist
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `gpt_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);

      const caption = imageUrl
        ? `━━━━━━━━━━━━━━━\n𝙀𝘿𝙄𝙏𝙄𝙉𝙂 𝙄𝙈𝘼𝙂𝙀 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙎𝙃𝘼𝘼𝙉 𝙆𝙃𝘼𝙉 𝙆\n━━━━━━━━━━━━━━━\n🎨 Prompt: ${prompt || "No prompt provided"}\n━━━━━━━━━━━━━━━`
        : `━━━━━━━━━━━━━━━\n🌟 GENERATED IMAGE\n━━━━━━━━━━━━━━━\n🎨 Prompt: ${prompt}\n━━━━━━━━━━━━━━━`;

      return api.sendMessage(
        {
          body: caption,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          // Cleanup file after 10 seconds
          setTimeout(() => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, 10000);
        },
        messageID
      );

    } catch (error) {
      global.logger.error(`Error in gpt command: ${error.message}`);
      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        "━━━━━━━━━━━━━━━\n" +
        "❌ ERROR GENERATION\n" +
        "━━━━━━━━━━━━━━━\n" +
        "⚠️ Failed to process the image. Try again later.\n" +
        "━━━━━━━━━━━━━━━",
        threadID,
        messageID
      );
    }
  }
};