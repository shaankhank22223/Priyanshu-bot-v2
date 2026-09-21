const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

const chatMemory = { history: {} };
const AI_API = "https://uzairrajputapis.qzz.io/api/ai/gemini";
const PRIYANSHU_API_KEY = "apim_41XuWvpF6tPq90Cvw503EYFY0UFvK53GHsGlIRxJ6hk";
const OWNER_TAG = "»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««";
const OWNER_UID = "100016828397863";

module.exports = {
  config: {
    name: "muskan",
    aliases: [],
    version: "1.0.0",
    description: "Muskan AI + Priyanshu API Media Downloader",
    usage: "{prefix}muskan [query]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "AI"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID, body } = message;
    let cleanedMsg = (body || "").replace(/^muskan[\s,!.?:-]*/i, "").trim();

    if (!cleanedMsg) return api.sendMessage("Bolo na Shaan, kya baat karni hai? 😘", threadID, messageID);

    const isVideoReq = /\b(video|vdo|mp4|film|movie)\b/i.test(cleanedMsg);
    const isAudioReq = /\b(song|music|audio|mp3|play|gaana|gane|ghana)\b/i.test(cleanedMsg);
    const isUrl = /(youtube\.com|youtu\.be)/i.test(cleanedMsg);

    if (isVideoReq || isAudioReq || isUrl) {
      try {
        api.setMessageReaction("⌛", messageID);
        let query = cleanedMsg.replace(/video|vdo|mp4|song|music|audio|mp3|play|gaana|gane|ghana/gi, "").trim();
        if (isUrl) query = cleanedMsg;

        const searchResult = await yts(query);
        if (!searchResult || !searchResult.videos.length) return api.sendMessage("Maafi, ye video ya song nahi mila 🥺💔", threadID, messageID);

        const video = searchResult.videos[0];
        const format = isVideoReq ? "mp4" : "mp3";
        const response = await axios.post(`https://priyanshuapi.qzz.io/api/runner/youtube-downloader-v2/download`, {
          url: video.url,
          format: format,
          quality: isVideoReq ? "360" : "320"
        }, { headers: { 'Authorization': `Bearer ${PRIYANSHU_API_KEY}` } });

        const downloadUrl = response.data?.data?.downloadUrl;
        const cachePath = path.join(__dirname, "cache", `${Date.now()}.${format}`);
        
        const writer = fs.createWriteStream(cachePath);
        const stream = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
        stream.data.pipe(writer);

        writer.on("finish", async () => {
          api.sendMessage({ body: `🖤 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n\n${OWNER_TAG}`, attachment: fs.createReadStream(cachePath) }, threadID, () => fs.unlinkSync(cachePath), messageID);
        });
      } catch (e) {
        api.sendMessage("❌ Error downloading media.", threadID, messageID);
      }
      return;
    }

    // AI Logic
    try {
      const res = await axios.post(AI_API, { prompt: `Muskan AI: ${cleanedMsg}` });
      api.sendMessage(res.data?.result?.answer || "Hmmm... 🥺", threadID, messageID);
    } catch (e) {
      api.sendMessage("Mera net thoda slow chal raha hai 🥺", threadID, messageID);
    }
  },

  handleEvent: async function({ api, message }) {
    const { body, senderID, threadID, messageReply } = message;
    if (!body || senderID == global.client.botID) return;
    if ((messageReply && messageReply.senderID == global.client.botID) || body.toLowerCase().startsWith("muskan")) {
      this.run({ api, message, args: [body] });
    }
  }
};