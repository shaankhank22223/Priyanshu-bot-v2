const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: ["profile", "dp", "pfp"],
    version: "1.0.0",
    description: "Kisi bhi user ki profile picture download karein",
    usage: "{prefix}pp [@mention | reply | link]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID, messageReply, mentions } = message;
    
    try {
      let uid;

      // 1. Check if replying to a message
      if (messageReply) {
        uid = messageReply.senderID;
      } 
      // 2. Check if mentioning someone
      else if (Object.keys(mentions).length > 0) {
        uid = Object.keys(mentions)[0];
      } 
      // 3. Check if a link is provided
      else if (args[0] && args[0].indexOf("facebook.com") !== -1) {
        try {
          uid = await api.getUID(args[0]);
        } catch (e) {
          return api.sendMessage("❌ Is link se ID nikalne mein masla ho raha hai.", threadID, messageID);
        }
      } 
      // 4. Default to sender
      else {
        uid = senderID;
      }

      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const url = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=${token}`;
      const tempPath = path.join(__dirname, "cache", `${uid}_pp.png`);

      // Ensure cache directory exists
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"));
      }

      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(tempPath, Buffer.from(response.data, "utf-8"));

      return api.sendMessage({
        body: "💞 Ye lijiye aapki profile DP 💞",
        attachment: fs.createReadStream(tempPath)
      }, threadID, () => {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in pp command: ${error.message}`);
      return api.sendMessage("❌ Profile picture nikalne mein khata hui hai. Shayad ID galat hai ya privacy lagi hui hai.", threadID, messageID);
    }
  }
};