const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

// REQUIRED: Gender normalization function
const { normalizeGender } = global.gender || { 
    normalizeGender: (gender) => {
        if (gender === 1 || gender === "FEMALE" || gender === "female") return "FEMALE";
        if (gender === 2 || gender === "MALE" || gender === "male") return "MALE";
        return null;
    }
};

const API_BASE_URL = "https://priyanshuapi.qzz.io";
const AI_CHAT_URL = `${API_BASE_URL}/api/runner/lite-ai/chat`;
const MUSIC_DOWNLOAD_URL = `${API_BASE_URL}/api/runner/youtube-downloader-v2/download`;
const SYSTEM_PROMPT = "Tumraha name is Muskan (مسکان). Ap Shaan ki Girlfriend hai, sweet, our intelligent ladki ho apka owner Shaan Khan Hai. Reply naturally and cleverly in the same language and style used by the user. Keep answers short, clear, and engaging.";

/**
 * Detects if the user wants a song or video
 */
function detectMediaIntent(text) {
  const mediaKeywords = ["gana", "song", "video", "mp3", "mp4", "play", "bhejo", "sunao", "download", "music", "gaane", "suna"];
  const lower = text.toLowerCase();
  const wantsVideo = lower.includes("video") || lower.includes("mp4");
  const wantsMedia = mediaKeywords.some(keyword => lower.includes(keyword));
  return { wantsMedia, wantsVideo };
}

/**
 * Downloads and sends media from YouTube
 */
async function downloadAndSendMedia({ api, threadID, messageID, query, isVideo, apiKey }) {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const extension = isVideo ? "mp4" : "mp3";
  const filePath = path.join(cacheDir, `${Date.now()}.${extension}`);
  let processingMsg;

  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);
    processingMsg = await api.sendMessage(`🔍 Searching for your ${isVideo ? "video" : "song"}...`, threadID);

    const searchResult = await ytSearch(query);
    if (!searchResult || !searchResult.videos.length) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (processingMsg) api.unsendMessage(processingMsg.messageID);
      return api.sendMessage("❌ Sorry, I couldn't find that song/video.", threadID, messageID);
    }

    const video = searchResult.videos[0];
    const payload = {
      url: video.url,
      format: isVideo ? "mp4" : "mp3",
      quality: isVideo ? "360" : "320"
    };

    const response = await axios.post(MUSIC_DOWNLOAD_URL, payload, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 60000
    });

    const downloadUrl = response.data?.data?.downloadUrl;
    if (!downloadUrl) throw new Error("Download link expired or not found.");

    const infoMsg = `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${video.author.name}\n\n»»OW𝑵𝑬𝑹««★™ »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««\n🥀 𝒀𝒆 𝒍𝒐 𝒃𝒂𝒃𝒚 𝒂𝒑𝒌𝒂 ${isVideo ? "𝒗𝒊𝒅𝒆𝒐" : "𝒔𝒐𝒏𝒈"} 🎶`;

    const responseStream = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    responseStream.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on("finish", async () => {
        const stats = fs.statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > 48) {
          if (processingMsg) api.unsendMessage(processingMsg.messageID);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.sendMessage(`⚠️ File is ${fileSizeMB.toFixed(2)}MB (Too large for Messenger).`, threadID, messageID);
          return resolve();
        }

        api.sendMessage({
          body: infoMsg,
          attachment: fs.createReadStream(filePath)
        }, threadID, (err) => {
          if (!err) api.setMessageReaction("✅", messageID, () => {}, true);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (processingMsg) api.unsendMessage(processingMsg.messageID);
          resolve();
        }, messageID);
      });
    });
  } catch (err) {
    if (processingMsg) api.unsendMessage(processingMsg.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
}

/**
 * Fetches AI Chat response
 */
async function getAiReply(senderID, promptText, apiKey) {
  const response = await axios.post(AI_CHAT_URL, {
    uid: String(senderID),
    prompt: promptText,
    systemPrompt: SYSTEM_PROMPT
  }, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    timeout: 20000
  });
  return response.data?.data?.choices?.[0]?.message?.content || "I'm here, but my brain feels a bit fuzzy. Ask again?";
}

module.exports = {
  config: {
    name: "muskan",
    aliases: ["ask", "chat", "bot"],
    version: "1.0.0",
    description: "Muskan AI: Sweet chat and instant music/video downloads",
    usage: "{prefix}muskan [message or song name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "FUN"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    const apiKey = global.config?.apiKeys?.priyanshuApi || "apim_CHxiCUER2oGsy5qcntUV2BFmIh-1bo3KJzG4Ujx4hoo";

    try {
      // 1. HANDLE EMPTY ARGS (Auto Reply Mode)
      if (args.length === 0) {
        const botRepliesPath = path.join(__dirname, "noprefix", "bot-reply.json");
        if (!fs.existsSync(botRepliesPath)) return api.sendMessage("Muskan is here! How can I help you? (Add a message or song name)", threadID, messageID);
        
        const botReplies = JSON.parse(fs.readFileSync(botRepliesPath, "utf8"));
        const userInfo = await api.getUserInfo(senderID);
        const userGender = normalizeGender(userInfo[senderID]?.gender);
        const userName = userInfo[senderID]?.name || "User";

        let replyCategory = (senderID === "61593959468855") ? "61593959468855" : (userGender || "default");
        let replies = botReplies[replyCategory] || botReplies.default || ["Ji bolye?"];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        return api.sendMessage(`🥀 ${userName} 😗, ${randomReply}`, threadID, (err, info) => {
          const repliesList = global.client.replies.get(threadID) || [];
          repliesList.push({
            command: this.config.name,
            messageID: info.messageID,
            expectedSender: senderID,
            data: { isFromBotReply: true }
          });
          global.client.replies.set(threadID, repliesList);
        }, messageID);
      }

      // 2. DETECT INTENT (Media vs AI)
      const input = args.join(" ").trim();
      const { wantsMedia, wantsVideo } = detectMediaIntent(input);

      if (wantsMedia) {
        // If user wants media, don't chat, just download.
        return await downloadAndSendMedia({ api, threadID, messageID, query: input, isVideo: wantsVideo, apiKey });
      } else {
        // Chat Mode
        const aiResponse = await getAiReply(senderID, input, apiKey);
        return api.sendMessage(aiResponse, threadID, (err, info) => {
          const replies = global.client.replies.get(threadID) || [];
          replies.push({
            command: this.config.name,
            messageID: info.messageID,
            expectedSender: senderID,
            data: { history: input }
          });
          global.client.replies.set(threadID, replies);
        }, messageID);
      }

    } catch (error) {
      global.logger.error(`Error in muskan command: ${error.message}`);
      return api.sendMessage("❌ Something went wrong in my system.", threadID, messageID);
    }
  },

  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, senderID, body } = message;
    const apiKey = global.config?.apiKeys?.priyanshuApi || "apim_CHxiCUER2oGsy5qcntUV2BFmIh-1bo3KJzG4Ujx4hoo";

    if (!body || senderID !== replyData.expectedSender) return;

    try {
      const { wantsMedia, wantsVideo } = detectMediaIntent(body);

      if (wantsMedia) {
        // User replied with a song/video request
        return await downloadAndSendMedia({ api, threadID, messageID, query: body, isVideo: wantsVideo, apiKey });
      } else {
        // Continue Chatting
        const aiResponse = await getAiReply(senderID, body, apiKey);
        return api.sendMessage(aiResponse, threadID, (err, info) => {
          const replies = global.client.replies.get(threadID) || [];
          replies.push({
            command: this.config.name,
            messageID: info.messageID,
            expectedSender: senderID,
            data: { history: body }
          });
          global.client.replies.set(threadID, replies);
        }, messageID);
      }
    } catch (error) {
      return api.sendMessage("❌ AI is currently unavailable.", threadID, messageID);
    }
  }
};