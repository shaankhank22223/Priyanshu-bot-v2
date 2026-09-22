const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "mp4",
    aliases: ["video", "vdoc"],
    version: "1.0.1",
    description: "Search 1-10 videos and download (360p+)",
    usage: "{prefix}mp4 [video name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "MEDIA"
  },

  run: async function ({ api, message, args, event }) {
    const msgData = message || event;
    const { threadID, messageID, senderID } = msgData;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❌ Please provide a video name.", threadID, messageID);
    }

    try {
      const headers = { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
      };

      // YouTube Search API
      const searchRes = await axios.get("https://uzairrajputapis.qzz.io/api/search/youtube", { 
        params: { q: query }, 
        headers 
      });
      
      const videos = searchRes.data?.result?.slice(0, 10);

      if (!videos || videos.length === 0) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      let searchList = "🔍 YouTube Search Results:\n\n";
      for (let i = 0; i < videos.length; i++) {
        searchList += `${i + 1}. ${videos[i].title} [${videos[i].timestamp || 'N/A'}]\n\n`;
      }

      searchList += `»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««\n          🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰👉 VIDEO LIST`;

      return api.sendMessage(searchList, threadID, (err, info) => {
        if (err) return;
        
        // Register reply listener
        const replyObj = {
          command: this.config.name,
          messageID: info.messageID,
          author: senderID,
          videos: videos
        };

        if (global.client.replies) {
          if (typeof global.client.replies.set === 'function') {
            const replies = global.client.replies.get(threadID) || [];
            replies.push(replyObj);
            global.client.replies.set(threadID, replies);
          } else {
            global.client.replies[info.messageID] = replyObj;
          }
        } else if (global.client.handleReply) {
          if (typeof global.client.handleReply.set === 'function') {
            global.client.handleReply.set(info.messageID, replyObj);
          } else {
            global.client.handleReply.push(replyObj);
          }
        }
      }, messageID);

    } catch (err) {
      if (global.logger) global.logger.error(`Error in mp4 search: ${err.message}`);
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  },

  handleReply: async function ({ api, event, message, handleReply, replyData }) {
    const msgData = event || message;
    const { threadID, messageID, body, senderID } = msgData;
    const data = replyData || handleReply || msgData.handleReply;

    if (!data) return;

    // Security check: Only original sender can pick a video
    if (data.author && data.author !== senderID) return;

    const choice = parseInt(body.trim());
    if (isNaN(choice) || choice < 1 || choice > data.videos.length) {
      return api.sendMessage("❌ Invalid choice! Choose a number from the list (1-10).", threadID, messageID);
    }

    const selectedVideo = data.videos[choice - 1];
    
    // Remove the list message to keep chat clean
    if (data.messageID) {
      api.unsendMessage(data.messageID).catch(() => {});
    }

    const waitMsg = await new Promise((resolve) => {
      api.sendMessage(`✅ Apki Request Jari Hai Please wait...`, threadID, (err, info) => {
        resolve(info);
      });
    });

    try {
      const headers = { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
      };

      // Downloader API
      const dlRes = await axios.post("https://uzairrajputapis.qzz.io/api/downloader/youtube", { 
        url: selectedVideo.url 
      }, { headers });
      
      const downloadUrl = dlRes.data?.result?.downloadUrl || dlRes.data?.downloadUrl;

      if (!downloadUrl) throw new Error("Could not retrieve a valid download link.");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const cachePath = path.join(cacheDir, `mp4_${Date.now()}.mp4`);
      
      const response = await axios({ 
        method: 'GET', 
        url: downloadUrl, 
        responseType: 'stream', 
        headers 
      });

      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        const stats = fs.statSync(cachePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        // Check if file exceeds Messenger limit (100MB)
        if (stats.size > 104857600) { 
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          if (waitMsg && waitMsg.messageID) api.unsendMessage(waitMsg.messageID).catch(() => {});
          return api.sendMessage(`⚠️ Size: ${fileSizeInMB}MB exceeds Messenger limit. Link: ${downloadUrl}`, threadID, messageID);
        }

        const msg = {
          body: `🖤 Title: ${selectedVideo.title}\n📊 Quality: HD\n📦 Size: ${fileSizeInMB}MB\n\n»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««\n🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰👉MUSIC-VIDEO`,
          attachment: fs.createReadStream(cachePath)
        };

        return api.sendMessage(msg, threadID, (err) => {
          if (err) api.sendMessage(`❌ Messenger failed to send file. Error: ${err.message}`, threadID, messageID);
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          if (waitMsg && waitMsg.messageID) api.unsendMessage(waitMsg.messageID).catch(() => {});
        }, messageID);
      });

      writer.on('error', (err) => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        if (waitMsg && waitMsg.messageID) api.unsendMessage(waitMsg.messageID).catch(() => {});
        if (global.logger) global.logger.error(`Error in writer: ${err.message}`);
        return api.sendMessage(`❌ Download stream error: ${err.message}`, threadID, messageID);
      });

    } catch (err) {
      if (waitMsg && waitMsg.messageID) api.unsendMessage(waitMsg.messageID).catch(() => {});
      if (global.logger) global.logger.error(`Error in mp4 download: ${err.message}`);
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
