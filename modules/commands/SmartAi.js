const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

const PRIYANSHU_API_KEY = "apim_woYjgHP57d44pyaII3LzkGZ5kSK-3tE-H0QYlWmEqDE";
const OWNER_TAG = "»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««";
const OWNER_UID = "100016828397863"; 
const LITE_AI_URL = "https://priyanshuapi.qzz.io/api/runner/lite-ai/chat";

// Gender Utility
const { normalizeGender } = global.gender || { 
    normalizeGender: (gender) => {
        if (gender === 1 || gender === "FEMALE" || gender === "female") return "FEMALE";
        if (gender === 2 || gender === "MALE" || gender === "male") return "MALE";
        return null;
    }
};

async function getAiReply(senderID, promptText, senderName, senderGender) {
  const apiKey = PRIYANSHU_API_KEY;
  
  const systemPrompt = `
Tum Muskan ho, ek smart aur cute ladki ho.
Behavioral Rules:
1. Normal Roman Urdu/Hinglish mein baat karo. 
2. Agar koi owner ke bare mein puche, to bolo "Shaan Khan mere owner, meri jaan aur mere love hain."
3. Jawab short, clear aur cute rakho (max 3 lines). Use emojis ✨💖.
4. User Name: ${senderName}, Gender: ${senderGender || "Unknown"}.
5. Agar sender UID (${senderID}) matches Shaan UID (${OWNER_UID}), treat him with extreme love and care like a wife/lover.
6. Agar sender UID 61592620318122 hai, treat him like a boyfriend.
7. Dusro ke liye ek cool friend raho.
  `.trim();

  const response = await axios.post(
    LITE_AI_URL,
    {
      uid: String(senderID),
      prompt: promptText,
      systemPrompt: systemPrompt
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 20000
    }
  );

  return response.data?.data?.choices?.[0]?.message?.content || "Kuch samajh nahi aaya, phir se bolo? 🥺";
}

module.exports = {
  config: {
    name: "muskan",
    aliases: ["ai", "bot", "ms"],
    version: "1.1.0",
    description: "Muskan AI with YouTube Downloader and Unified Control",
    usage: "{prefix}[muskan/ai/bot] [message/song/video]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "AI"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    // Typing indicator (3 dots) start
    let stopTyping;
    if (typeof api.sendTypingIndicator === "function") {
      stopTyping = api.sendTypingIndicator(threadID);
    }

    try {
      let query = (args.join(" ") || "").trim();

      if (!query) {
        return api.sendMessage("Bolo na Shaan, kya baat karni hai? 😘", threadID, messageID);
      }

      const isVideoReq = /\b(video|vdo|mp4|film|movie)\b/i.test(query);
      const isAudioReq = /\b(song|music|audio|mp3|play|gaana|gane|ghana)\b/i.test(query);
      const isUrl = /(youtube\.com|youtu\.be)/i.test(query);

      // --- Media Downloader Section ---
      if (isVideoReq || isAudioReq || isUrl) {
        api.setMessageReaction("⌛", messageID, () => {}, true);

        let searchQuery = query.replace(/video|vdo|mp4|song|music|audio|mp3|play|gaana|gane|ghana/gi, "").trim();
        if (isUrl) searchQuery = query;

        const searchResult = await yts(searchQuery);
        if (!searchResult || !searchResult.videos.length) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage("Maafi, ye video ya song nahi mila 🥺💔", threadID, messageID);
        }

        const video = searchResult.videos[0];
        const format = isVideoReq ? "mp4" : "mp3";

        const downloadResponse = await axios.post(`https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download`, {
          url: video.url,
          format: format,
          quality: isVideoReq ? "360" : "320"
        }, {
          headers: { Authorization: `Bearer ${PRIYANSHU_API_KEY}`, 'Content-Type': 'application/json' },
          timeout: 120000
        });

        const downloadUrl = downloadResponse.data?.data?.downloadUrl;
        if (!downloadUrl) throw new Error("Download link missing");

        const cachePath = path.join(__dirname, "cache", `muskan_${Date.now()}.${format}`);
        if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });

        const infoMsg = `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${video.author.name}\n\n${OWNER_TAG}\n🥀 𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰 👉 ${format.toUpperCase()}`;

        const responseStream = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
        const writer = fs.createWriteStream(cachePath);
        responseStream.data.pipe(writer);

        writer.on("finish", async () => {
          const stats = fs.statSync(cachePath);
          if (stats.size > 48 * 1024 * 1024) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            fs.unlinkSync(cachePath);
            return api.sendMessage("⚠️ File size limit (48MB) se zyada hai!", threadID, messageID);
          }

          api.setMessageReaction("✅", messageID, () => {}, true);
          api.sendMessage({ body: infoMsg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
            setTimeout(() => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, 30000);
          }, messageID);
        });

        return;
      }

      // --- AI Chat Section ---
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo[senderID]?.name || "User";
      const gender = normalizeGender(userInfo[senderID]?.gender);

      const aiReply = await getAiReply(senderID, query, name, gender);
      return api.sendMessage(aiReply, threadID, messageID);

    } catch (error) {
      if (global.logger) global.logger.error(`Error in Muskan: ${error.message}`);
      else console.error(`Error in Muskan: ${error.message}`);
      
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Server busy hai baby, thodi der baad try karo! 🥺", threadID, messageID);
    } finally {
      // Stop typing indicator when done
      if (typeof stopTyping === "function") stopTyping();
    }
  },

  handleEvent: async function ({ api, message }) {
    const { body, senderID, messageReply } = message;
    if (!body || senderID == api.getCurrentUserID()) return;

    const lowerBody = body.toLowerCase();
    const isBotReply = messageReply && messageReply.senderID == api.getCurrentUserID();
    const isTriggerWord = /^(muskan|ai|bot|ms)\b/i.test(lowerBody);

    if (isBotReply || isTriggerWord) {
      let cleanedText = body.replace(/^(muskan|ai|bot|ms)\s*/i, "").trim();
      const args = cleanedText ? cleanedText.split(/\s+/) : [];
      return this.run({ api, message, args });
    }
  }
};
