const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

// REQUIRED: Gender normalization function as per rules
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

// Helper functions
function detectMediaIntent(text) {
  const mediaKeywords = ["gana", "song", "video", "mp3", "mp4", "play", "bhejo", "sunao", "download", "music"];
  const lower = text.toLowerCase();
  const wantsVideo = lower.includes("video") || lower.includes("mp4");
  const wantsMedia = mediaKeywords.some(keyword => lower.includes(keyword));
  return { wantsMedia, wantsVideo };
}

async function downloadAndSendMedia({ api, threadID, messageID, query, isVideo, apiKey }) {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const extension = isVideo ? "mp4" : "mp3";
  const filePath = path.join(cacheDir, `${Date.now()}.${extension}`);
  let processingMsg;

  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);
    processingMsg = await api.sendMessage("✅ Apki Request Jari Hai Please Wait...", threadID);

    const searchResult = await ytSearch(query);
    if (!searchResult || !searchResult.videos.length) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (processingMsg) api.unsendMessage(processingMsg.messageID);
      return api.sendMessage("❌ Song/Video not found.", threadID, messageID);
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
    if (!downloadUrl) throw new Error("Download link not found.");

    const infoMsg = `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${video.author.name}\n\n»»OW𝑵𝑬𝑹««★™ »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««\n🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰 👉 ${isVideo ? "VIDEO" : "SONG"}`;

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
          api.sendMessage(`⚠️ File size (${fileSizeMB.toFixed(2)}MB) is too large for Messenger.`, threadID, messageID);
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
    return api.sendMessage(`❌ Failed: ${err.message}`, threadID, messageID);
  }
}

async function getAiReply(senderID, promptText, apiKey) {
  const response = await axios.post(AI_CHAT_URL, {
    uid: String(senderID),
    prompt: promptText,
    systemPrompt: SYSTEM_PROMPT
  }, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    timeout: 20000
  });
  return response.data?.data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";
}

module.exports = {
  config: {
    name: "muskan",
    aliases: ["ask", "chat", "ai"],
    version: "1.0.0",
    description: "Talk to Muskan AI (supports auto song/video downloads)",
    usage: "{prefix}muskan <your message>",
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
      // HANDLE NO ARGUMENTS (Auto Random Reply)
      if (args.length === 0) {
        const botRepliesPath = path.join(__dirname, "noprefix", "bot-reply.json");
        if (!fs.existsSync(botRepliesPath)) return api.sendMessage("❌ Configuration file missing.", threadID, messageID);
        
        const botReplies = JSON.parse(fs.readFileSync(botRepliesPath, "utf8"));
        const userInfo = await api.getUserInfo(senderID);
        const userGender = normalizeGender(userInfo[senderID]?.gender);
        const userName = userInfo[senderID]?.name || "User";

        let replyCategory = "default";
        if (senderID === "100016828397863") replyCategory = "100016828397863";
        else if (userGender === "MALE") replyCategory = "MALE";
        else if (userGender === "FEMALE") replyCategory = "FEMALE";

        let replies = botReplies[replyCategory] || botReplies.default || [];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const formattedReply = `🥀 ${userName} 😗, ${randomReply}`;

        return api.sendMessage({ body: formattedReply, mentions: [{ tag: userName, id: senderID }] }, threadID, (err, info) => {
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

      // HANDLE ARGUMENTS (AI or Media)
      const promptText = args.join(" ").trim();
      const { wantsMedia, wantsVideo } = detectMediaIntent(promptText);

      if (wantsMedia) {
        return await downloadAndSendMedia({ api, threadID, messageID, query: promptText, isVideo: wantsVideo, apiKey });
      }

      const aiResponse = await getAiReply(senderID, promptText, apiKey);
      return api.sendMessage(`🤖 ${aiResponse}`, threadID, (err, info) => {
        const replies = global.client.replies.get(threadID) || [];
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: { history: promptText }
        });
        global.client.replies.set(threadID, replies);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in muskan command: ${error.message}`);
      return api.sendMessage("❌ An error occurred. Please try again later.", threadID, messageID);
    }
  },

  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, senderID, body } = message;
    const apiKey = global.config?.apiKeys?.priyanshuApi || "apim_CHxiCUER2oGsy5qcntUV2BFmIh-1bo3KJzG4Ujx4hoo";

    if (!body) return;

    try {
      const { wantsMedia, wantsVideo } = detectMediaIntent(body);
      if (wantsMedia) {
        return await downloadAndSendMedia({ api, threadID, messageID, query: body, isVideo: wantsVideo, apiKey });
      }

      const aiResponse = await getAiReply(senderID, body, apiKey);
      return api.sendMessage(`🤖 ${aiResponse}`, threadID, (err, info) => {
        const replies = global.client.replies.get(threadID) || [];
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: { history: body }
        });
        global.client.replies.set(threadID, replies);
      }, messageID);
    } catch (error) {
      return api.sendMessage("❌ AI response failed.", threadID, messageID);
    }
  }
};