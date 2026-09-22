const axios = require("axios");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt", "tik"],
    version: "1.0.0",
    description: "Search TikTok videos or fetch random video from a user profile",
    usage: "{prefix}tiktok [keyword or @username]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;
    let rawKeyword = args.join(" ").trim();

    if (!rawKeyword) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Please provide a keyword or TikTok username.\n\nExamples:\n1. {prefix}tiktok Zoro edit\n2. {prefix}tiktok @username", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // Clean up '@' if username is provided
      const cleanQuery = rawKeyword.startsWith("@") ? rawKeyword.substring(1) : rawKeyword;

      const searchUrl = `https://toshiro-api-editz6t9.vercel.app/api/search/tiksearch?keyword=${encodeURIComponent(cleanQuery)}`;
      const { data } = await axios.get(searchUrl, { timeout: 15000 });

      let videoData = null;

      // Checking if API returns an array of results or single object
      if (data.success && Array.isArray(data.result) && data.result.length > 0) {
        // Pick a random video from the returned profile/search list
        const randomIndex = Math.floor(Math.random() * data.result.length);
        videoData = data.result[randomIndex];
      } else if (data.success && data.result?.video) {
        videoData = data.result;
      }

      if (!videoData || (!videoData.video && !videoData.play)) {
        throw new Error("No videos found for this username or keyword.");
      }

      const videoUrl = videoData.video || videoData.play;
      const title = videoData.title || "No Title";
      const author = videoData.author?.nickname || videoData.author || "Unknown";
      const duration = videoData.duration || 0;

      // Stream download with User-Agent header
      const videoStream = await axios.get(videoUrl, {
        responseType: "stream",
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      api.setMessageReaction("✅", messageID, () => {}, true);

      const msg = {
        body: `╭━━━━━━━━━━━━╮\n  🎵 𝑻𝒊𝒌𝑻𝒐𝒌 𝑺𝒆𝒂𝒓𝒄𝒉\n╰━━━━━━━━━━━━╯\n\n🔍 𝗤𝘂𝗲𝗿𝘆: ${rawKeyword}\n🎬 𝗧𝗶𝘁𝗹𝗲: ${title}\n👤 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: ${author}\n⏳ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${duration}s\n\n✅ »»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰👉 TIKTOK-VIDEO`,
        attachment: videoStream.data
      };

      return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
      global.logger.error(`Error in tiktok command: ${err.message}`);
      api.setMessageReaction("❌", messageID, () => {}, true);
      
      const errorMessage = err.response?.data?.message || err.message;
      return api.sendMessage(`❌ Failed to fetch video.\nReason: ${errorMessage}`, threadID, messageID);
    }
  }
};