const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ============================================
// FACEBOOK GRAPH API TOKEN FOR PROFILE PICTURES
// ============================================
const FALLBACK_GRAPH_TOKEN = '6628568379%7Cc1e620fa708a1d5696fb991c1bde5662';

// Gender normalization helper as per rules
const { normalizeGender } = global.gender || { 
    normalizeGender: (gender) => {
        if (gender === 1 || gender === "FEMALE" || gender === "female") return "FEMALE";
        if (gender === 2 || gender === "MALE" || gender === "male") return "MALE";
        return null;
    }
};

// Custom functions from your original code
async function getApiBase() {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const res = await axios.get(GITHUB_RAW);
    return res.data.saimx69x;
  } catch (e) {
    console.error("GitHub raw fetch error:", e.message);
    return null;
  }
}

async function toFont(text, id = 21) {
  try {
    const apiBase = await getApiBase();
    if (!apiBase) return text;
    const apiUrl = `${apiBase}/api/font?id=${id}&text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);
    return data.output || text;
  } catch (e) {
    console.error("Font API error:", e.message);
    return text;
  }
}

const urduPoetry = [
  "تیری چاہت میں بکھرنے کی خواہش ہے،\nتیرے ساتھ ہی تو سنورنے کی خواہش ہے۔ ✨🌹",
  "دل تو صرف ایک ہی تھا،\nجو ہم نے تیرے نام کر دیا۔ 💖✨",
  "تم سے جو رابطہ بنا ہے نا،\nوہ کوئی اتفاق نہیں، مقدر ہے ہمارا۔ 💞🕊️",
  "تیرے بغیر جی نہیں لگتا،\nتم ہی تو میری ہر خوشی کا سبب ہو۔ 🌷💘",
  "باتیں تو بہت ہیں کہنے کو،\nپر تم مسکرا دو تو سب مکمل لگتا ہے۔ ✨🌸",
  "میری ہر دعا کا اثر ہو تم،\nکاش ہمیشہ کے لیے میرے ہو تم۔ 🌹💫"
];

module.exports = {
  config: {
    name: "pair",
    aliases: ["match2", "lovematch"],
    version: "1.0.0",
    description: "Generate a love match with a random opposite gender member",
    usage: "{prefix}pair2",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 10,
    category: "FUN"
  },

  run: async function({ api, message }) {
    const { threadID, messageID, senderID } = message;
    const cachePath = path.join(__dirname, "cache", `pair2_${senderID}_${Date.now()}.png`);

    try {
      // 1. Get Sender Info and Normalize Gender
      const senderInfoArr = await api.getUserInfo(senderID);
      const senderNameRaw = senderInfoArr[senderID].name;
      const senderGender = normalizeGender(senderInfoArr[senderID]?.gender);

      if (!senderGender) {
        return api.sendMessage("❌ Could not detect your gender to find a match.", threadID, messageID);
      }

      const targetGender = senderGender === "FEMALE" ? "MALE" : "FEMALE";

      // 2. Get Thread Info for potential matches
      const threadInfo = await api.getThreadInfo(threadID);
      const potentialMatches = [];

      if (Array.isArray(threadInfo.userInfo)) {
        for (const user of threadInfo.userInfo) {
          if (user.id === senderID) continue;
          
          const userGender = normalizeGender(user.gender);
          if (userGender === targetGender) {
            potentialMatches.push({
              userID: user.id,
              name: user.name || "Unknown"
            });
          }
        }
      }

      if (potentialMatches.length === 0) {
        return api.sendMessage(`❌ No ${targetGender.toLowerCase()} users found in this group for a match.`, threadID, messageID);
      }

      // 3. Select Random Match
      const randomMatch = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
      
      // 4. Apply Fonts
      const senderName = await toFont(senderNameRaw, 21);
      const matchName = await toFont(randomMatch.name, 21);

      // 5. Prepare Image API
      const apiBase = await getApiBase();
      if (!apiBase) {
        return api.sendMessage("❌ Failed to fetch API base. Please try again later.", threadID, messageID);
      }

      const avatar1 = `https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=${FALLBACK_GRAPH_TOKEN}`;
      const avatar2 = `https://graph.facebook.com/${randomMatch.userID}/picture?height=720&width=720&access_token=${FALLBACK_GRAPH_TOKEN}`;

      const apiUrl = `${apiBase}/api/pair?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}`;

      // 6. Download Image
      const imageRes = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, Buffer.from(imageRes.data, "binary"));

      // 7. Generate Random Stats
      const lovePercent = Math.floor(Math.random() * 31) + 70;
      const randomPoetry = urduPoetry[Math.floor(Math.random() * urduPoetry.length)];

      const responseText = `💞 𝗠𝗮𝘁𝗰𝗵𝗺𝗮𝗸𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 💞\n\n🎀 ${senderName} ✨️\n🎀 ${matchName} ✨️\n\n🕊️ ${randomPoetry}\n\n💘 𝙲𝚘𝚖𝚙𝚊𝚝𝚒𝚋𝚒𝚕𝚒𝚝𝚢: ${lovePercent}% 💘`;

      // 8. Send Result
      return api.sendMessage({
        body: responseText,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (error) {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      global.logger.error(`Error in pair2 command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while generating your match.", threadID, messageID);
    }
  }
};