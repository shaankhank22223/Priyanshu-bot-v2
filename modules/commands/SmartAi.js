const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

// API Configuration
const PRIYANSHU_API_KEY = "apim_woYjgHP57d44pyaII3LzkGZ5kSK-3tE-H0QYlWmEqDE";
const OWNER_TAG = "»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««";

module.exports = {
  config: {
    name: "muskan",
    aliases: ["song", "video", "play", "vdo"],
    version: "1.0.0",
    description: "Muskan Media Downloader (Video/Audio only)",
    usage: "muskan [song name/video link]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID } = message;
    let query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage("Bolo na Shaan, kaunsa song ya video chahiye? 🥀", threadID, messageID);
    }

    try {
      // --- MEDIA DOWNLOADER LOGIC ---
      const isVideoReq = /\b(video|vdo|mp4|film|movie)\b/i.test(query);
      const isAudioReq = /\b(song|music|audio|mp3|play|gaana|gane|ghana)\b/i.test(query);
      const isUrl = /(youtube\.com|youtu\.be)/i.test(query);

      // Default to audio if no specific keyword is found but a query exists
      const format = isVideoReq ? "mp4" : "mp3";
      
      api.setMessageReaction("⌛", messageID, () => {}, true);
      
      // Clean query from keywords
      let searchQuery = query.replace(/video|vdo|mp4|song|music|audio|mp3|play|gaana|gane|ghana/gi, "").trim();
      if (isUrl) searchQuery = query;

      const searchResult = await yts(searchQuery || "new song");
      if (!searchResult || !searchResult.videos.length) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("Maafi, ye video ya song nahi mila 🥺💔", threadID, messageID);
      }

      const video = searchResult.videos[0];

      const dlResponse = await axios.post(`https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download`, {
        url: video.url,
        format: format,
        quality: isVideoReq ? "360" : "320"
      }, {
        headers: { 
          'Authorization': `Bearer ${PRIYANSHU_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        timeout: 120000
      });

      const downloadUrl = dlResponse.data?.data?.downloadUrl;
      if (!downloadUrl) throw new Error("No download link found");

      const cachePath = path.join(__dirname, "cache", `muskan_${Date.now()}.${format}`);
      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

      const infoMsg = `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${video.author.name}\n\n${OWNER_TAG}\n🥀 𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰 👉 ${format.toUpperCase()}`;

      const response = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage({ 
          body: infoMsg, 
          attachment: fs.createReadStream(cachePath) 
        }, threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);
      });

      writer.on("error", (err) => {
        throw err;
      });

    } catch (error) {
      console.error("Muskan Downloader Error:", error.response?.data || error.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Server thoda busy hai, thodi der baad try karo baby! 🥺", threadID, messageID);
    }
  }
};