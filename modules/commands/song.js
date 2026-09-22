const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "video",
    aliases: ["vdo", "mp4"],
    version: "1.0.0",
    description: "Search and download video from YouTube with details",
    usage: "{prefix}video [video name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "MEDIA"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    const input = args.join(" ");

    if (!input) {
      return api.sendMessage("❌ Please enter a video name.", threadID, messageID);
    }

    try {
      const searchResults = await ytSearch(input);
      if (!searchResults || !searchResults.videos.length) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      const results = searchResults.videos.slice(0, 6);
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      let msg = "🎬 Top 6 Video Results:\n\n";
      const attachments = [];
      const thumbnailPaths = [];

      for (let i = 0; i < results.length; i++) {
        const video = results[i];
        const thumbURL = video.thumbnail;
        const thumbPath = path.join(cacheDir, `thumb-${video.videoId}-${Date.now()}.jpg`);

        try {
          const thumbData = await axios.get(thumbURL, { responseType: "arraybuffer" });
          fs.writeFileSync(thumbPath, thumbData.data);
          attachments.push(fs.createReadStream(thumbPath));
          thumbnailPaths.push(thumbPath);
        } catch (e) {
          console.error("Error downloading thumbnail:", e);
        }

        msg += `${i + 1}. ${video.title}\n`;
        msg += `⏱️ Duration: ${video.timestamp} | 👀 Views: ${video.views}\n\n`;
      }

      msg += "👉 Reply with the number to download video.";

      return api.sendMessage(
        {
          body: msg,
          attachment: attachments,
        },
        threadID,
        (err, info) => {
          if (err) return console.error("Send failed:", err);

          const replies = global.client.replies.get(threadID) || [];
          replies.push({
            command: this.config.name,
            messageID: info.messageID,
            expectedSender: senderID,
            data: {
              results,
              messageIDToDelete: info.messageID,
              thumbnailPaths
            }
          });
          global.client.replies.set(threadID, replies);

          // Cleanup thumbnails
          setTimeout(() => {
            thumbnailPaths.forEach(p => {
              if (fs.existsSync(p)) fs.unlinkSync(p);
            });
          }, 60000);
        },
        messageID
      );

    } catch (error) {
      global.logger.error(`Error in video command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while searching.", threadID, messageID);
    }
  },

  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, body, senderID } = message;
    
    if (senderID !== replyData.expectedSender) return;

    const index = parseInt(body.trim());
    if (!replyData.results || isNaN(index) || index < 1 || index > replyData.results.length) {
      return api.sendMessage("❌ Please reply with a valid number (1-6).", threadID, messageID);
    }

    const video = replyData.results[index - 1];
    const videoUrl = video.url;
    const apiKey = global.config.apiKeys?.priyanshuApi;

    if (!apiKey) {
      return api.sendMessage("❌ API key not found in config.", threadID, messageID);
    }

    // Unsend the previous list message to keep chat clean
    if (replyData.messageIDToDelete) {
      api.unsendMessage(replyData.messageIDToDelete);
    }

    const processingMsg = await api.sendMessage(`⏳ Generating video for: ${video.title}...`, threadID, messageID);

    try {
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

      const { downloadUrl, title } = response.data.data;
      let finalTitle = title && title !== "YouTube Video" ? title : video.title;

      // Size Check (FCA limits are usually 25MB-50MB depending on version)
      try {
        const headResponse = await axios.head(downloadUrl);
        const contentLength = headResponse.headers["content-length"];
        if (contentLength && parseInt(contentLength) > 48 * 1024 * 1024) {
          if (processingMsg) api.unsendMessage(processingMsg.messageID);
          return api.sendMessage("❌ Video size exceeds the limit (max 48MB for stability).", threadID, messageID);
        }
      } catch (e) {
        console.error("Size check error:", e);
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const safeFilename = `video_${Date.now()}.mp4`;
      const filePath = path.join(cacheDir, safeFilename);

      // Robust streaming download
      const writer = fs.createWriteStream(filePath);
      const downloadResponse = await axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream",
      });

      downloadResponse.data.pipe(writer);

      writer.on("finish", () => {
        // Double check file existence and size for FCA stability
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
          if (processingMsg) api.unsendMessage(processingMsg.messageID);
          return api.sendMessage("❌ File download failed.", threadID, messageID);
        }

        if (processingMsg) api.unsendMessage(processingMsg.messageID);
          
        const finalBody = `🎬 Title: ${finalTitle}\n` +
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
            if (err) global.logger.error("Error sending video: " + err.message);
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
      global.logger.error(`Error in handleReply: ${error.message}`);
      return api.sendMessage("❌ An error occurred during processing.", threadID, messageID);
    }
  }
};