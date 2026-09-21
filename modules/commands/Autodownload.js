const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "autodownload",
    aliases: ["auto", "dl"],
    version: "1.0.0",
    description: "Auto detects and downloads media from FB, Insta, TikTok, YT, Shorts, Pinterest.",
    usage: "{prefix}autodownload",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    // This command works automatically via handleEvent.
    return api.sendMessage("This command automatically detects links in the chat and downloads the media.", message.threadID, message.messageID);
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, body } = message;
    
    // Skip if there is no text or it starts with the prefix
    if (!body || body.startsWith(global.config.prefix)) return;

    // Direct link detection
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const links = body.match(urlRegex);
    if (!links || links.length === 0) return;

    const targetUrl = links[0];

    try {
      // Import the downloader inside try-catch to handle missing module
      const { alldown } = require('arif-babu-downloader');
      
      // Processing reaction
      api.setMessageReaction('⏳', messageID, () => {}, true);

      let videoUrl = null;
      let title = "Downloaded Media";

      // --- 1. Downloader API Call ---
      try {
        const res = await alldown(targetUrl);
        if (res) {
          title = res.title || res.data?.title || title;
          videoUrl = res.url || res.data?.video || res.data?.high || res.data?.low || res.data?.url || (res.data?.medias && res.data.medias[0]?.url);
        }
      } catch (e) {
        // Fallback logged to console
      }

      // --- 2. Fallback API (YouTube / TikTok / Insta Alternative) ---
      if (!videoUrl) {
        const backupRes = await axios.get(`https://api.vytal.project/download?url=${encodeURIComponent(targetUrl)}`).catch(() => null);
        if (backupRes?.data?.url) {
          videoUrl = backupRes.data.url;
          title = backupRes.data.title || title;
        }
      }

      if (!videoUrl) {
        api.setMessageReaction('❌', messageID, () => {}, true);
        return;
      }

      // --- 3. Cache Folder Setup ---
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `auto_${Date.now()}.mp4`);

      // --- 4. Stream Download ---
      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.setMessageReaction('✅', messageID, () => {}, true);

        return api.sendMessage({
          body: `✨❁ ━━ ━[ 𝐎𝐖𝐍𝐄𝐑 ]━ ━━ ❁✨\n\nᴛɪᴛʟᴇ: ${title}\n\n✨❁ ━━ ━[ 𝐒𝐇𝐀𝐀𝐍 ]━ ━━ ❁✨`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on('error', (err) => {
        global.logger.error(`Stream Write Error: ${err.message}`);
        api.setMessageReaction('❌', messageID, () => {}, true);
      });

    } catch (error) {
      global.logger.error(`AutoDownload Error: ${error.message}`);
      api.setMessageReaction('❌', messageID, () => {}, true);
    }
  }
};