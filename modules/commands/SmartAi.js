const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

const PRIYANSHU_API_KEY = "apim_woYjgHP57d44pyaII3LzkGZ5kSK-3tE-H0QYlWmEqDE";
const OWNER_TAG = "»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««";
const OWNER_UID = "100016828397863"; 

const LITE_AI_URL = "https://priyanshuapi.qzz.io/api/runner/lite-ai/chat";

// AI Response Fetcher using Priyanshu Lite AI
async function getAiReply(senderID, promptText) {
  const apiKey = global.config?.apiKeys?.priyanshuApi || process.env.PRIYANSHU_API_KEY || PRIYANSHU_API_KEY;

  if (!apiKey) {
    throw new Error("Priyanshu API key missing.");
  }

  const systemPrompt = `
Tum Muskan ho, ek smart aur cute ladki ho jo sabhi languages mein baat kar sakti hai.
Behavioral Rules:
1. Normal Roman Urdu, Hinglish mein baat karo. Agar koi owner ke bare mein puche, to bolo "Shaan Khan mere owner, meri jaan aur mere love hain."
2. Jawab short, clear aur cute rakho (max 3 lines).
3. Emojis ka use karo.
4. Agar sender UID (${senderID}) matches Shaan UID (${OWNER_UID}), treat him with extreme love and care.
5. Agar sender UID 61592620318122 hai, treat him like a boyfriend.
6. Dusro ke liye ek cool friend raho.
  `.trim();

  const response = await axios.post(
    LITE_AI_URL,
    {
      uid: String(senderID),
      prompt: promptText,
      systemPrompt: systemPrompt
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 20000
    }
  );

  const aiText = response.data?.data?.choices?.[0]?.message?.content;
  if (typeof aiText !== "string" || !aiText.trim()) {
    throw new Error("Invalid AI response format.");
  }

  return aiText.trim();
}

module.exports = {
  config: {
    name: "muskan",
    aliases: ["ai", "bot"],
    version: "2.1.0",
    description: "Muskan AI (Priyanshu Lite AI) + Media Downloader",
    usage: "{prefix}muskan [message/song name/video name]",
    credit: "Shaan Khan",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "AI"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    try {
      let cleanedMsg = (args.join(" ") || "").trim();

      if (!cleanedMsg) {
        return api.sendMessage("Bolo na Shaan, kya baat karni hai? 😘", threadID, messageID);
      }

      const isVideoReq = /\b(video|vdo|mp4|film|movie)\b/i.test(cleanedMsg);
      const isAudioReq = /\b(song|music|audio|mp3|play|gaana|gane|ghana)\b/i.test(cleanedMsg);
      const isUrl = /(youtube\.com|youtu\.be)/i.test(cleanedMsg);

      // --- Media Downloader Logic ---
      if (isVideoReq || isAudioReq || isUrl) {
        api.setMessageReaction("⌛", messageID, () => {}, true);

        let query = cleanedMsg.replace(/video|vdo|mp4|song|music|audio|mp3|play|gaana|gane|ghana/gi, "").trim();
        if (isUrl) query = cleanedMsg;

        if (!query) return api.sendMessage("Naam to batao kya download karun? 🥺", threadID, messageID);

        const searchResult = await yts(query);
        if (!searchResult || !searchResult.videos.length) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage("Maafi, ye video ya song nahi mila 🥺💔", threadID, messageID);
        }

        const video = searchResult.videos[0];
        const videoUrl = video.url;
        const format = isVideoReq ? "mp4" : "mp3";

        const apiUrl = `https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download`;

        const response = await axios.post(apiUrl, {
          url: videoUrl,
          format: format,
          quality: isVideoReq ? "360" : "320"
        }, {
          headers: {
            'Authorization': `Bearer ${PRIYANSHU_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        });

        const downloadUrl = response.data?.data?.downloadUrl;
        if (!downloadUrl) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage("Download link nahi mil paaya, API issue ho sakta hai. 🥺", threadID, messageID);
        }

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const fileName = `muskan_${Date.now()}_${senderID}.${format}`;
        const cachePath = path.resolve(cacheDir, fileName);

        const infoMsg = `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${video.author.name}\n\n${OWNER_TAG}\n🥀 𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰👉 ${format.toUpperCase()}`;

        const writer = fs.createWriteStream(cachePath);
        const streamResponse = await axios({
          url: downloadUrl,
          method: 'GET',
          responseType: 'stream',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        streamResponse.data.pipe(writer);

        writer.on("finish", async () => {
          try {
            if (!fs.existsSync(cachePath)) throw new Error("File not found");

            const stats = fs.statSync(cachePath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (stats.size === 0) {
              if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
              return api.sendMessage("❌ File empty download hui.", threadID, messageID);
            }

            if (fileSizeInMB > 48) {
              api.setMessageReaction("❌", messageID, () => {}, true);
              if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
              return api.sendMessage("⚠️ File size limit (48MB) se zyada hai!", threadID, messageID);
            }

            api.setMessageReaction("✅", messageID, () => {}, true);

            if (isAudioReq) {
              return api.sendMessage(infoMsg, threadID, (err) => {
                if (!err) {
                  api.sendMessage({
                    attachment: fs.createReadStream(cachePath)
                  }, threadID, () => {
                    if (fs.existsSync(cachePath)) {
                      setTimeout(() => fs.unlinkSync(cachePath), 5000);
                    }
                  });
                }
              }, messageID);
            } else {
              return api.sendMessage({
                body: infoMsg,
                attachment: fs.createReadStream(cachePath)
              }, threadID, () => {
                if (fs.existsSync(cachePath)) {
                  setTimeout(() => fs.unlinkSync(cachePath), 5000);
                }
              }, messageID);
            }

          } catch (e) {
            console.error(e);
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          }
        });

        writer.on("error", (err) => {
          api.sendMessage("❌ Stream Error!", threadID, messageID);
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        });

        return;
      }

      // --- AI Chat Logic ---
      const aiReply = await getAiReply(senderID, cleanedMsg);
      return api.sendMessage(aiReply, threadID, messageID);

    } catch (error) {
      console.error("Muskan AI Error:", error.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Server busy hai, thodi der baad try karo! 🥺", threadID, messageID);
    }
  },

  handleEvent: async function ({ api, message }) {
    const { body, senderID } = message;
    if (!body || senderID == api.getCurrentUserID()) return;

    const lowerBody = body.toLowerCase();
    
    // Check if the message is a reply to the bot
    const isBotReply = message.messageReply && message.messageReply.senderID == api.getCurrentUserID();

    // Trigger words check: "muskan", "ai", "bot"
    const isTriggerWord = /^(muskan|ai|bot)\b/i.test(lowerBody) || /\b(bot|ai)\b/i.test(lowerBody);

    if (isBotReply || isTriggerWord) {
      // Extract prompt text by removing trigger keywords if present at the start
      let cleanedText = body.replace(/^(muskan|ai|bot)\s*/i, "").trim();
      if (!cleanedText) cleanedText = body;

      const args = cleanedText.split(/\s+/);
      return this.run({ api, message, args });
    }
  }
};
