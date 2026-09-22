module.exports = {
  config: {
    name: "goibot",
    aliases: ["botreply"],
    version: "1.0.0",
    description: "Goibot noprefix auto reply for various keywords and emojis",
    usage: "Just type keywords (e.g., hello, hi, ❤️, 🙈🙈)",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "GENERAL"
  },

  run: async function({ api, message }) {
    // This command works automatically via handleEvent
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, body } = message;

    if (!body) return;

    try {
      const input = body.toLowerCase();

      // Define the automated replies mapping
      const replies = {
        /* ================= EMOJI REPLIES ================= */
        "🙈🙈": "Mujhe pata hai tum bander ho 🐒🤣\nChhup ke kya kar rahe ho 😜",
        "🙉🙉": "Kaan band karke kya milega 😂\nSach to sunna hi padega 😏",
        "🐒": "Bander mil gaya 🐒😂\nZoo se bhaag aaye ho kya 😆",
        "🙊": "Muh band kar liya 🙊😂\nSach bolne ka time aa gaya 😜",
        "😏": "Aise kya dekh rahe ho 😏\nKuch gadbad lag rahi 😎",
        "🤐": "Bilkul chup 🤐😜\nLagta hai kaand hua 😂",
        "😂": "Itni hasi kyun 😂😂\nJoke mast tha kya 😆",
        "😭": "Arre baba 😭\nKya dukh aa gaya 🫂",
        "❤️": "Dil se bheja ❤️\nMood romantic lagta 😌",
        "💔": "Dil toot gaya kya 💔\nChal hug le lo 🫂",

        /* ================= TEXT REPLIES ================= */
        "hello": "Hello ji 👋🙂\nKya haal chaal 😄",
        "hi": "Hi dost 😄\nKaise ho 🙂",
        "oye": "Oye haan bolo 😌\nKya scene hai 😜",
        "kaise ho": "Main mast hoon 😎\nTum batao kya haal 😌",
        "kese ho": "Bilkul badhiya 😄\nLife set chal rahi 😎",
        "good morning": "Good morning 🌅\nChai pi li ya nahi ☕",
        "good night": "Good night 🌙😴\nSweet dreams 😌",
        "kya kar rahe ho": "Tumse baat 😌\nAur kya hi kaam 😄",
        "free ho": "Tumhare liye hamesha 😉\nBolo kya plan 😎",
        "i love you": "Love you too ❤️😘\nDil se 😌",
        "miss you": "Main bhi miss kar raha 😌\nJaldi milenge 🫂",
        "sad": "Sad kyun 😟\nBatao kya hua 🫂",
        "nobody loves me": "Aisa mat socho 🫂❤️\nMain hoon na 😌",
        "bhai": "Bhai ho to tu hi 😎\nFull support 💪",
        "yaar": "Yaar tu dil ka banda 😌\nSolid dost 🤝",
        "lol": "Lol 😂😂\nHas has ke pagal 😆",
        "hmm": "Hmm 🤔\nSoch gehri lag rahi 😏",
        "acha": "Acha 😄\nPhir theek hai 😌",
        "boring": "Boring ho raha 😴\nMain hoon na 😎",
        "school": "School ka time 📚\nTeacher se bach ke 😜",
        "college": "College life 😎📖\nPadhai + masti 😄",
        "khana khaya": "Haan kha liya 😄\nTumne khaya 🍽️",
        "bhook lagi": "Bhook lagi 😄\nKuch tasty kha lo 😋",
        "sleep": "So jao 😴\nKal fresh rahoge 😌",
        "dp": "DP mast hai 😎\nStyle full 🔥",
        "attitude": "Attitude level high 😎🔥\nApna swag 😏",
        "plan": "Plan solid hai 😎\nExecute karte hain 🔥",
        "chill": "Chill scene 😎❄️\nNo tension 😄",
        "tension": "Tension mat le 😌\nSab set ho jayega 💪"
      };

      // Check if the input exists in our replies object
      if (replies.hasOwnProperty(input)) {
        return api.sendMessage(replies[input], threadID, messageID);
      }

    } catch (error) {
      global.logger.error(`Error in goibot event: ${error.message}`);
    }
  }
};