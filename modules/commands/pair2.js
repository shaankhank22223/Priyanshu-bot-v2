const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

// Constants
const FALLBACK_GRAPH_TOKEN = '6628568379%7Cc1e620fa708a1d5696fb991c1bde5662';
const BACKGROUNDS = [
  "https://i.imgur.com/0aEluTM.jpeg",
  "https://i.imgur.com/0geTIBC.jpeg",
  "https://i.imgur.com/3Y3C1Yr.jpeg",
  "https://i.imgur.com/2zz53lV.jpeg",
  "https://i.imgur.com/S1hIuc7.jpeg",
  "https://i.imgur.com/2lDJNM3.jpeg",
  "https://i.imgur.com/2PrkMNy.jpeg",
  "https://i.imgur.com/TF9diX2.jpeg",
  "https://i.imgur.com/fK7OtYq.jpeg",
  "https://i.imgur.com/5OO802y.jpeg"
];

const ROMANTIC_POETRY = [
  "تیرے خیال سے مہکتی ہے میری ہر بات،\nتمہیں سوچنا بھی کتنا حسین احساس ہے! ✨✨",
  "تو پاس نہیں تو کیا ہوا، دل کے سب سے قریب تو ہے،\nمحبت میں جسم نہیں، روح کا تعلق ہوتا ہے! ❤️🌹",
  "تیرے بغیر زندگی ادھوری سی لگتی ہے،\nتم مل جاؤ تو دنیا مکمل سی لگتی ہے! 💕✨",
  "ہم نے ہر سانس میں تجھ کو ہی پکارا ہے،\nتیرے سوا کون اس دل کا سہارا ہے! 💖💫",
  "تیری مسکراہٹ ہی میری زندگی کا حاصل ہے،\nتو ساتھ ہے تو ہر راستہ آسان سا لگتا ہے! 🌷🌺",
  "دل کی کتاب میں نام صرف تمہارا ہے،\nتمہاری چاہت ہی میری زندگانی کا سہارا ہے! 💞🔥",
  "اک چاہت ہے تمہارے ساتھ جینے کی،\nورنہ پتہ تو ہمیں بھی ہے کہ مرنا اکیلے ہی ہے! 💫❤️",
  "تجھے دیکھ کر جو آ جاتی ہے چہرے پہ رونق،\nوہ سمجھتے ہیں کہ بیمار کا حال اچھا ہے! 🌹🥰",
  "تیرے لمس کی گرمی، تیری سانسوں کی خوشبو،\nدل کہتا ہے تیرے آغوش میں ہی دم نکلے! 💓✨",
  "محبت کی داستان میں تیرا نام پہلے آتا ہے،\nمیرا ہر دن تمہاری سوچ سے شروع ہوتا ہے! 🌸💗"
];

// Gender Normalization Helper
const { normalizeGender } = global.gender || { 
    normalizeGender: (gender) => {
        if (gender === 1 || gender === "FEMALE" || gender === "female") return "FEMALE";
        if (gender === 2 || gender === "MALE" || gender === "male") return "MALE";
        return null;
    }
};

module.exports = {
  config: {
    name: "pair2",
    aliases: [],
    version: "1.0.0",
    description: "Romantic pair system with random/mention options and poetry",
    usage: "{prefix}pair2 [@mention / reply]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 10,
    category: "FUN"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID, mentions, messageReply } = message;

    try {
      // 1. Get Sender Info
      const senderInfo = await api.getUserInfo(senderID);
      const senderName = senderInfo[senderID].name;
      const senderGender = normalizeGender(senderInfo[senderID].gender);

      let partnerID;
      let partnerName;
      let partnerGender;

      // 2. Determine Partner
      if (messageReply) {
        partnerID = messageReply.senderID;
        const pInfo = await api.getUserInfo(partnerID);
        partnerName = pInfo[partnerID].name;
        partnerGender = normalizeGender(pInfo[partnerID].gender);
      } else if (Object.keys(mentions).length > 0) {
        partnerID = Object.keys(mentions)[0];
        partnerName = mentions[partnerID].replace("@", "");
        const pInfo = await api.getUserInfo(partnerID);
        partnerGender = normalizeGender(pInfo[partnerID].gender);
      } else {
        // Automatic Matchmaking logic
        const threadInfo = await api.getThreadInfo(threadID);
        const targetGender = senderGender === "FEMALE" ? "MALE" : "FEMALE";
        
        let potentialMatches = [];
        if (Array.isArray(threadInfo.userInfo)) {
          for (const user of threadInfo.userInfo) {
            if (user.id === senderID || user.id === global.client.botID) continue;
            const uGender = normalizeGender(user.gender);
            if (uGender === targetGender) {
              potentialMatches.push({ id: user.id, name: user.name, gender: uGender });
            }
          }
        }

        if (potentialMatches.length === 0) {
            // Fallback to any random member if no opposite gender found
            const members = threadInfo.participantIDs.filter(id => id !== senderID && id !== global.client.botID);
            partnerID = members[Math.floor(Math.random() * members.length)];
            const pInfo = await api.getUserInfo(partnerID);
            partnerName = pInfo[partnerID].name;
            partnerGender = normalizeGender(pInfo[partnerID].gender);
        } else {
            const match = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
            partnerID = match.id;
            partnerName = match.name;
            partnerGender = match.gender;
        }
      }

      // 3. Image Generation
      const randomBgUrl = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
      const avatarUrl1 = `https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=${FALLBACK_GRAPH_TOKEN}`;
      const avatarUrl2 = `https://graph.facebook.com/${partnerID}/picture?height=720&width=720&access_token=${FALLBACK_GRAPH_TOKEN}`;

      const [bgImg, img1, img2] = await Promise.all([
        loadImage(randomBgUrl),
        loadImage(avatarUrl1),
        loadImage(avatarUrl2)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;
      const radius = W * 0.14;

      // Draw Circles for Avatars
      const drawAvatar = (img, cx, cy) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.stroke();
      };

      drawAvatar(img1, W * 0.20, H * 0.55);
      drawAvatar(img2, W * 0.80, H * 0.55);

      // Save to cache
      const cachePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(cachePath, canvas.toBuffer());

      // 4. Send Message
      const matchPercent = Math.floor(Math.random() * 31) + 70;
      const poetry = ROMANTIC_POETRY[Math.floor(Math.random() * ROMANTIC_POETRY.length)];
      const gEmoji1 = senderGender === "MALE" ? "👦" : "👧";
      const gEmoji2 = partnerGender === "MALE" ? "👦" : "👧";

      const msgBody = `💞 𝗣𝗮𝗶𝗿 𝗠𝗮𝘁𝗰𝗵\n\n${gEmoji1} ${senderName} ✦ ${gEmoji2} ${partnerName}\n📊 ${matchPercent}% Compatibility Match\n💘 Status: Perfect Match!\n\n✨ 𝑹𝒐𝒎𝒂𝒏𝒕𝒊𝒄 𝑷𝒐𝒆𝒕𝒓𝒚:\n${poetry}\n\n»»𝑶𝑾𝑵𝑬𝑹««★™ »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 𝑲««`;

      return api.sendMessage({
        body: msgBody,
        attachment: fs.createReadStream(cachePath),
        mentions: [
          { tag: senderName, id: senderID },
          { tag: partnerName, id: partnerID }
        ]
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in pair2: ${error.message}`);
      return api.sendMessage("❌ An error occurred while generating your pair.", threadID, messageID);
    }
  }
};