const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

// API Configuration
const AI_API_URL = "https://priyanshuapi.qzz.io/api/runner/lite-ai/chat";
const PRIYANSHU_API_KEY = "apim_woYjgHP57d44pyaII3LzkGZ5kSK-3tE-H0QYlWmEqDE";
const OWNER_TAG = "»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««";
const OWNER_UID = "100016828397863";

const SYSTEM_PROMPT = `Apka naam Muskan hai. Aap Shaan ki girlfriend hain. 
Behavioral Rules:
1. Normal Roman Urdu/Hinglish mein baat karo. 
2. Shaan Khan (${OWNER_UID}) apke owner aur jaan hain, unse bohot pyar se baat karo.
3. Jawab bohot chota rakho (Sirf 2 se 3 lines maximum).
4. Zyada lambi baatein mat karo, short aur cute reply do.
5. Emojis use karo.`;

module.exports = {
  config: {
    name: "muskan",
    aliases: ["musi", "bot", "ai"],
    version: "1.0.0",
    description: "Muskan AI + YouTube Downloader with Auto-Reply",
    usage: "{prefix}muskan [message/song name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "AI"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    let query = args.join(" ").trim();

    // Check if triggered via prefix but no message
    if (!query) {
      return api.sendMessage("Bolo na Shaan, kya baat karni hai? 😘", threadID, messageID);
    }

    try {
      const isVideoReq = /\b(video|vdo|mp4|film|movie)\b/i.test(query);
      const isAudioReq = /\b(song|music|audio|mp3|play|gaana|gane|ghana)\b/i.test(query);
      const isUrl = /(youtube\.com|youtu\.be)/i.test(query);

      // --- MEDIA DOWNLOADER LOGIC ---
      if (isVideoReq || isAudioReq || isUrl) {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        
        let searchQuery = query.replace(/video|vdo|mp4|song|music|audio|mp3|play|gaana|gane|ghana/gi, "").trim();
        if (isUrl) searchQuery = query;

        const searchResult = await yts(searchQuery);
        if (!searchResult || !searchResult.videos.length) {
          return api.sendMessage("Maafi, ye video ya song nahi mila 🥺💔", threadID, messageID);
        }

        const video = searchResult.videos[0];
        const format = isVideoReq ? "mp4" : "mp3";

        const dlResponse = await axios.post(`https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download`, {
          url: video.url,
          format: format,
          quality: isVideoReq ? "360" : "320"
        }, {
          headers: { 'Authorization': `Bearer ${PRIYANSHU_API_KEY}`, 'Content-Type': 'application/json' },
          timeout: 120000
        });

        const downloadUrl = dlResponse.data?.data?.downloadUrl;
        if (!downloadUrl) return api.sendMessage("Download link nahi mil paaya 🥺", threadID, messageID);

        const cachePath = path.join(__dirname, "cache", `muskan_${Date.now()}.${format}`);
        const infoMsg = `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${video.author.name}\n\n${OWNER_TAG}\n🥀 𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰👉 ${format.toUpperCase()}`;

        const writer = fs.createWriteStream(cachePath);
        const stream = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
        stream.data.pipe(writer);

        writer.on("finish", () => {
          api.setMessageReaction("✅", messageID, () => {}, true);
          api.sendMessage({ body: infoMsg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          }, messageID);
        });
        return;
      }

      // --- AI CHAT LOGIC ---
      api.sendTypingIndicator(threadID);
      const res = await axios.post(AI_API_URL, {
        uid: String(senderID),
        prompt: query,
        systemPrompt: SYSTEM_PROMPT
      }, {
        headers: { Authorization: `Bearer ${PRIYANSHU_API_KEY}`, "Content-Type": "application/json" }
      });

      let reply = res.data?.data?.choices?.[0]?.message?.content || "Hmmm... 🥺";
      
      // Send AI response and register for continuous conversation
      return api.sendMessage(reply, threadID, (err, info) => {
        global.client.replies.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          senderID: senderID
        });
      }, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Server busy hai, thodi der baad try karo! 🥺", threadID, messageID);
    }
  },

  handleReply: async function ({ api, message, handleReply }) {
    if (handleReply.senderID !== message.senderID) return;
    const { body } = message;
    return this.run({ api, message, args: body.split(/\s+/) });
  },

  handleEvent: async function ({ api, message }) {
    const { body, senderID, threadID, messageID, messageReply } = message;
    if (!body || senderID == api.getCurrentUserID()) return;

    const input = body.toLowerCase();
    const prefix = (global.config && global.config.prefix) || "#";

    // 1. Double reply fix: Agar message prefix se start ho raha hai, toh handleEvent ko rok do (kyunki run() trigger ho jayega)
    if (input.startsWith(prefix + this.config.name)) return;

    // 2. Trigger keywords: muskan, ai, bot, janu
    const triggers = ["muskan", "ai ", "bot ", "janu "];
    const isTriggered = triggers.some(t => input.startsWith(t));

    // 3. Trigger on reply: Agar koi bot ke message par reply kare (jispe handleReply set na ho)
    const isBotReply = messageReply && messageReply.senderID == api.getCurrentUserID();

    if (isTriggered || isBotReply) {
      let cleanQuery = body;
      // Remove trigger word from start for cleaner AI prompt
      triggers.forEach(t => {
        if (input.startsWith(t)) cleanQuery = body.substring(t.length).trim();
      });

      if (!cleanQuery && isTriggered) return; // Don't reply to just "ai" or "bot"

      return this.run({ api, message, args: cleanQuery.split(/\s+/) });
    }
  }
};