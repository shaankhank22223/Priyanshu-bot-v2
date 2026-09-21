const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "meme",
    aliases: [],
    version: "1.0.0",
    description: "Random meme images.",
    usage: "{prefix}meme",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 1,
    category: "FUN"
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;

    try {
      const link = [
        "https://i.imgur.com/2YpLtS7.jpeg",
        "https://i.imgur.com/2U6ZsLI.jpeg",
        "https://i.imgur.com/7JHCJXX.jpeg",
        "https://i.imgur.com/wiQsALL.jpeg",
        "https://i.imgur.com/VKVryDl.jpeg",
        "https://i.imgur.com/bXWt2Vo.jpeg",
        "https://i.imgur.com/HE4lB0J.jpeg",
        "https://i.imgur.com/tC2Sy8a.jpg"
      ];

      // Random link select karein
      const randomImage = link[Math.floor(Math.random() * link.length)];
      
      // Cache directory check karein
      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

      const tempPath = path.join(cachePath, `meme_${Date.now()}.jpg`);

      // Image download karein (Binary Stream me)
      const response = await axios({
        method: "GET",
        url: randomImage,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        return api.sendMessage({
          body: `😂 𝐒𝐇𝐀𝐀𝐍 𝐄𝐃𝐈𝐓𝐎𝐑 😂\n\nTotal photos available: ${link.length}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => {
          // File delete karein bhejne ke baad
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }, messageID);
      });

      writer.on("error", (err) => {
        return api.sendMessage("❌ Image load karne mein error aaya.", threadID, messageID);
      });

    } catch (error) {
      return api.sendMessage("❌ Image load karne mein error aaya.", threadID, messageID);
    }
  }
};
