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
        return "Unknown";
    }
};

async function getAiReply(senderID, promptText, senderName, senderGender) {
  const systemPrompt = `
Tum Muskan ho, ek smart aur cute ladki ho. Jawab Roman Urdu/Hinglish mein do.
User Name: ${senderName}, Gender: ${senderGender}.
Rules:
1. Shaan Khan (${OWNER_UID}) tumhare owner aur love hain.
2. Agar sender UID (${senderID}) Shaan hai, to bahut pyar se baat karo (like a wife).
3. Dusro ke liye ek cool/cute friend raho.
4. Short responses (max 3 lines) ✨💖.
  `.trim();

  try {
    const response = await axios.post(LITE_AI_URL, {
      uid: String(senderID),
      prompt: promptText,
      systemPrompt: systemPrompt
    }, {
      headers: { Authorization: `Bearer ${PRIYANSHU_API_KEY}`, "Content-Type": "application/json" },
      timeout: 20000
    });
    return response.data?.data?.choices?.[0]?.message?.content || "Kuch samajh nahi aaya baby? 🥺";
  } catch (e) {
    return "Server thoda slow hai, gussa mat hona! 🥺";
  }
}

module.exports = {
  config: {
    name: "muskan",
    aliases: ["ai", "bot", "ms"],
    version: "1.1.0",
    description: "Muskan AI with Typing Status and Auto-Media Downloader",
    usage: "{prefix}muskan [query/song/video]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "AI"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage("Bolo na Shaan, kya baat karni hai? 😘", threadID, messageID);
    }

    // Show "typing..." status
    api.sendTypingIndicator(threadID);

    try {
      const isVideoReq = /\b(video|vdo|mp4|film|movie)\b/i.test(query);
      const isAudioReq = /\b(song|music|audio|mp3|play|gaana|gane|ghana)\b/i.test(query);
      const isUrl = /(youtube\.com|youtu\.be)/i.test(query);

      if (isVideoReq || isAudioReq || isUrl) {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        let searchQuery = query.replace(/video|vdo|mp4|song|music|audio|mp3|play|gaana|gane|ghana/gi, "").trim();
        if (isUrl) searchQuery = query;

        const searchResult = await yts(searchQuery);
        if (!searchResult.videos.length) return api.sendMessage("Maafi baby, ye mila nahi 🥺", threadID, messageID);

        const video = searchResult.videos[0];
        const format = isVideoReq ? "mp4" : "mp3";

        // 1. Send Title First as requested
        await api.sendMessage(`🎵 | 𝗕𝗮𝗯𝘆, 𝗠𝗮𝗶𝗻 𝗮𝗮𝗽𝗸𝗮 𝘀𝗼𝗻𝗴 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗸𝗮𝗿 𝗿𝗮𝗵𝗶 𝗵𝗼𝗼𝗻...\n\n📝 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${video.timestamp}`, threadID);

        // 2. Start Download process while keeping typing indicator active
        api.sendTypingIndicator(threadID);

        const dlRes = await axios.post(`https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download`, {
          url: video.url, format: format, quality: isVideoReq ? "360" : "320"
        }, {
          headers: { Authorization: `Bearer ${PRIYANSHU_API_KEY}` },
          timeout: 120000
        });

        const downloadUrl = dlRes.data?.data?.downloadUrl;
        if (!downloadUrl) throw new Error("Link failed");

        const cachePath = path.join(__dirname, "cache", `muskan_${Date.now()}.${format}`);
        const writer = fs.createWriteStream(cachePath);
        const stream = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
        
        stream.data.pipe(writer);

        writer.on("finish", () => {
          api.setMessageReaction("✅", messageID, () => {}, true);
          api.sendMessage({
            body: `✨ 𝗬𝗲 𝗹𝗼 𝗯𝗮𝗯𝘆 𝗮𝗮𝗽𝗸𝗮 ${format.toUpperCase()}!\n\n${OWNER_TAG}`,
            attachment: fs.createReadStream(cachePath)
          }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          }, messageID);
        });
        return;
      }

      // --- AI Chat Logic ---
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo[senderID]?.name || "User";
      const gender = normalizeGender(userInfo[senderID]?.gender);

      const reply = await getAiReply(senderID, query, name, gender);

      return api.sendMessage(reply, threadID, (err, info) => {
        if (err) return;
        const replies = global.client.replies.get(threadID) || [];
        replies.push({ command: this.config.name, messageID: info.messageID, expectedSender: senderID });
        global.client.replies.set(threadID, replies);
      }, messageID);

    } catch (error) {
      return api.sendMessage("Server busy hai, thodi der baad try karna 🥺", threadID, messageID);
    }
  },

  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, senderID, body } = message;
    if (senderID !== replyData.expectedSender) return;

    api.sendTypingIndicator(threadID);

    try {
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo[senderID]?.name || "User";
      const gender = normalizeGender(userInfo[senderID]?.gender);

      const reply = await getAiReply(senderID, body, name, gender);

      return api.sendMessage(reply, threadID, (err, info) => {
        if (err) return;
        const replies = global.client.replies.get(threadID) || [];
        replies.push({ command: this.config.name, messageID: info.messageID, expectedSender: senderID });
        global.client.replies.set(threadID, replies);
      }, messageID);
    } catch (e) {
      return api.sendMessage("System error baby 🥺", threadID, messageID);
    }
  }
};