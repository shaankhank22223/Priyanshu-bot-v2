const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "say",
    aliases: [],
    version: "1.0.0",
    description: "Convert text to speech (Bengali voice)",
    usage: "{prefix}say [text] or reply to a message",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, messageReply, type } = message;

    try {
      // Determine the content: use reply text if available, otherwise use arguments
      let content = (type === "message_reply") ? messageReply.body : args.join(" ");

      if (!content) {
        return api.sendMessage("Please provide text or reply to a message to use this command.", threadID, messageID);
      }

      // Ensure cache folder exists
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const tempPath = path.join(cacheDir, `say_${Date.now()}.mp3`);

      // Google TTS URL for Bengali voice
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=bn&client=tw-ob`;

      // Download audio data
      const response = await axios({
        method: 'get',
        url: ttsUrl,
        responseType: 'arraybuffer'
      });

      fs.writeFileSync(tempPath, Buffer.from(response.data));

      // Send the audio file and delete it after sending
      return api.sendMessage({
        attachment: fs.createReadStream(tempPath)
      }, threadID, (err) => {
        if (err) global.logger.error(err);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in say command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while generating the voice.", threadID, messageID);
    }
  }
};