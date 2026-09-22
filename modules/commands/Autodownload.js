const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Initialize a global set to track processed message IDs if it doesn't exist
if (!global.processedAutoDL) {
  global.processedAutoDL = new Set();
}

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

  run: async function({ api, message }) {
    return api.sendMessage("✅ 𝐀𝐮𝐭𝐨-𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 is active.\n\nI will automatically download videos from:\n• Facebook\n• TikTok\n• Instagram\n• YouTube / Shorts\n• Pinterest\n\nJust paste the link in the chat!", message.threadID, message.messageID);
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, body, senderID } = message;

    // 1. Basic validation: No body, bot's own message, or starts with prefix
    if (!body || senderID === api.getCurrentUserID() || senderID === global.client.botID) return;
    if (body.startsWith(global.config.prefix)) return;

    // 2. STOPS TRIPLE REPLY: Check if this messageID has already been processed
    if (global.processedAutoDL.has(messageID)) return;

    // 3. Detect URL
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const links = body.match(urlRegex);
    if (!links || links.length === 0) return;

    const targetUrl = links[0];

    // 4. Filter for supported platforms
    const supported = [
      "tiktok.com", "facebook.com", "fb.watch", "fb.com",
      "instagram.com", "instagr.am", "youtube.com", "youtu.be",
      "pinterest.com", "pin.it"
    ];

    if (!supported.some(s => targetUrl.toLowerCase().includes(s))) return;

    // 5. Mark as processed IMMEDIATELY to prevent double execution
    global.processedAutoDL.add(messageID);
    
    // Keep memory clean: remove old IDs if the set gets too large
    if (global.processedAutoDL.size > 100) {
      const iterator = global.processedAutoDL.values();
      global.processedAutoDL.delete(iterator.next().value);
    }

    try {
      api.setMessageReaction('⏳', messageID, () => {}, true);

      let videoUrl = null;
      let title = "Downloaded Media";

      // --- Attempt 1: Using arif-babu-downloader ---
      try {
        const { alldown } = require('arif-babu-downloader');
        const res = await alldown(targetUrl);
        if (res && res.data) {
          title = res.data.title || title;
          videoUrl = res.data.video || res.data.high || res.data.low || res.data.url || (res.data.medias && res.data.medias[0]?.url);
        }
      } catch (e) {
        // Silently fail to attempt next method
      }

      // --- Attempt 2: Backup API for YouTube/Shorts/Insta ---
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

      // --- Setup File Path ---
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `auto_${Date.now()}.mp4`);

      // --- Download Stream ---
      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.setMessageReaction('✅', messageID, () => {}, true);
        
        const msg = {
          body: `✨❁ ━━ ━[ 𝐎𝐖𝐍𝐄𝐑 ]━ ━━ ❁✨\n\nᴛɪᴛʟᴇ: ${title}\n\n✨❁ ━━ ━[ 𝐒𝐇𝐀𝐀𝐍 ]━ ━━ ❁✨`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(msg, threadID, (err) => {
          if (err) global.logger.error("Auto-DL Send Error: " + err);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on('error', (err) => {
        global.logger.error("Auto-DL Writer Error: " + err);
        api.setMessageReaction('❌', messageID, () => {}, true);
      });

    } catch (error) {
      global.logger.error(`AutoDownload Main Error: ${error.message}`);
      api.setMessageReaction('❌', messageID, () => {}, true);
    }
  }
};