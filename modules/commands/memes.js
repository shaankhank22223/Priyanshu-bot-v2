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
    cooldown: 5,
    category: "FUN"
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;

    try {
      const links = [
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
      const randomImage = links[Math.floor(Math.random() * links.length)];
      
      // Cache directory ensure karein
      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

      const tempPath = path.join(cachePath, `meme_${Date.now()}.jpg`);

      // Image download karein (proper headers ke saath)
      const response = await axios.get(randomImage, { 
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      // Binary data ko save karein (utf-8 hata diya gaya hai)
      fs.writeFileSync(tempPath, Buffer.from(response.data));

      return api.sendMessage({
        body: `😂 𝐒𝐇𝐀𝐀𝐍 𝐄𝐃𝐈𝐓𝐎𝐑 😂\n\nTotal photos available: ${links.length}`,
        attachment: fs.createReadStream(tempPath)
      }, threadID, () => {
        // File delete karein bhejne ke baad
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in meme command: ${error.message}`);
      return api.sendMessage("❌ Image load karne mein error aaya. Network ya API ka issue ho sakta hai.", threadID, messageID);
    }
  }
};