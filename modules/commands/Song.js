const axios = require("axios");
const fs = require("fs");
const path = require("path");

// API Endpoints
const AUDIO_API = "https://uzairrajputapis.qzz.io/api/downloader/ytmp3";
const YT_SEARCH = "https://uzairrajputapis.qzz.io/api/search/youtube";

function getVideoID(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = {
  config: {
    name: "song",
    aliases: [],
    version: "1.0.0",
    description: "YouTube song downloader",
    usage: "{prefix}song [Song Name or Link]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❌ Please provide a song name or YouTube link!", threadID, messageID);
    }

    let searchMsgID;
    const tempPath = path.join(__dirname, "cache", `song_${Date.now()}.mp3`);

    try {
      // 1. Initial response
      const info = await api.sendMessage("✅Apki request jari hai please wait...", threadID);
      searchMsgID = info.messageID;

      let videoUrl = query;
      let title = "song";

      // 2. Search if not a direct URL
      if (!getVideoID(query)) {
        const searchResponse = await axios.get(YT_SEARCH, { params: { q: query } });
        const video = searchResponse.data?.result?.[0] || searchResponse.data?.result?.items?.[0];
        
        if (!video) {
          if (searchMsgID) api.unsendMessage(searchMsgID);
          return api.sendMessage("❌ No results found for your query.", threadID, messageID);
        }
        videoUrl = video.url;
        title = video.title || "audio";
      }

      // 3. Get download link from Audio API
      const downloadResponse = await axios.post(AUDIO_API, { url: videoUrl });
      const songData = downloadResponse.data?.result || downloadResponse.data;
      const downloadLink = songData.download_url || songData.video || songData.url;

      if (!downloadLink) {
        if (searchMsgID) api.unsendMessage(searchMsgID);
        return api.sendMessage("⚠️ Could not generate a download link for this song.", threadID, messageID);
      }

      // 4. Download file to cache
      const writer = fs.createWriteStream(tempPath);
      const stream = await axios.get(downloadLink, { responseType: "stream" });
      stream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 5. Success Message and File Sending
      if (searchMsgID) api.unsendMessage(searchMsgID);

      const successText = `🖤 Title: ${songData.title || title}\n\n━━━━━━━━━━━━━\n✨ »»𝑶𝑾𝑵𝑬𝑹««★™ »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰👉SONG`;

      await api.sendMessage({
        body: successText,
        attachment: fs.createReadStream(tempPath)
      }, threadID, () => {
        // Cleanup after sending
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in song command: ${error.message}`);
      if (searchMsgID) api.unsendMessage(searchMsgID);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return api.sendMessage("⚠️ Server is not responding or an error occurred!", threadID, messageID);
    }
  }
};