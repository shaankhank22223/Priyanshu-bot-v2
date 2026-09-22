const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "video",
    aliases: ["vdo", "mp4", "directvideo"],
    version: "1.0.0",
    description: "Search and download video directly from YouTube with dynamic title",
    usage: "{prefix}video [video name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 10,
    category: "MEDIA"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID } = message;
    const input = args.join(" ");

    if (!input) {
      return api.sendMessage("❌ Please enter a video name.", threadID, messageID);
    }

    // Reaction for starting the request
    api.setMessageReaction("⌛", messageID, (err) => {}, true);
    
    const processingMsg = await api.sendMessage(`✅ Apki Request Jari Hai Please wait...`, threadID, messageID);

    try {
      // 1. Search for the video
      const searchResults = await ytSearch(input);
      if (!searchResults || !searchResults.videos.length) {
        if (processingMsg) api.unsendMessage(processingMsg.messageID);
        api.setMessageReaction("❌", messageID, (err) => {}, true);
        return api.sendMessage("❌ No results found for your query.", threadID, messageID);
      }

      const video = searchResults.videos[0]; 
      const videoUrl = video.url;
      const videoTitle = video.title; // Capture the real title
      const apiKey = global.config.apiKeys?.priyanshuApi;

      if (!apiKey) {
        if (processingMsg) api.unsendMessage(processingMsg.messageID);
        return api.sendMessage("❌ API key not found in config.", threadID, messageID);
      }

      // 2. Get Download Link from API
      const apiUrl = "https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download";
      const response = await axios.post(
        apiUrl,
        {
          link: videoUrl,
          format: "mp4",
          videoQuality: "360",
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.success || !response.data.data) {
        if (processingMsg) api.unsendMessage(processingMsg.messageID);
        return api.sendMessage("❌ Failed to fetch video download link.", threadID, messageID);
      }

      const { downloadUrl } = response.data.data;

      // 3. Size Check for FCA Stability (Max 48MB)
      try {
        const headResponse = await axios.head(downloadUrl);
        const contentLength = headResponse.headers["content-length"];
        if (contentLength && parseInt(contentLength) > 48 * 1024 * 1024) {
          if (processingMsg) api.unsendMessage(processingMsg.messageID);
          api.setMessageReaction("⚠️", messageID, (err) => {}, true);
          return api.sendMessage("❌ Video size exceeds the 48MB limit. Try a shorter video.", threadID, messageID);
        }
      } catch (e) {
        console.error("Size check error:", e);
      }

      // 4. Download to Cache
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);

      const downloadResponse = await axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream",
      });

      downloadResponse.data.pipe(writer);

      writer.on("finish", () => {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
          if (processingMsg) api.unsendMessage(processingMsg.messageID);
          return api.sendMessage("❌ File download failed.", threadID, messageID);
        }

        // 5. Send the Video
        if (processingMsg) api.unsendMessage(processingMsg.messageID);

        // Updated Body to include the official video title
        const finalBody = `🎬 Title: ${videoTitle}\n` +
          `⏱️ Duration: ${video.timestamp}\n` +
          `👤 Artist: ${video.author.name}\n` +
          `👀 Views: ${video.views}\n\n` +
          `»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰 👉 MUSIC-VIDEO`;

        api.sendMessage(
          {
            body: finalBody,
            attachment: fs.createReadStream(filePath),
          },
          threadID,
          (err) => {
            if (err) {
                global.logger.error("Error sending video: " + err.message);
            } else {
                // Done reaction when sent successfully
                api.setMessageReaction("✅", messageID, (e) => {}, true);
            }
            // Cleanup file after sending
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          },
          messageID
        );
      });

      writer.on("error", (err) => {
        if (processingMsg) api.unsendMessage(processingMsg.messageID);
        api.sendMessage("❌ Stream processing error.", threadID, messageID);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (error) {
      if (processingMsg) api.unsendMessage(processingMsg.messageID);
      global.logger.error(`Error in video command: ${error.message}`);
      api.setMessageReaction("❌", messageID, (e) => {}, true);
      return api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
    }
  }
};