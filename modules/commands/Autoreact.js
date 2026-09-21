const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "autoreact",
    aliases: [],
    version: "1.0.0",
    description: "Auto react on specific emojis and keywords",
    usage: "{prefix}autoreact",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 0,
    category: "SYSTEM"
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    return api.sendMessage("This command runs automatically in the background when you type specific keywords or emojis.", threadID, messageID);
  },

  handleEvent: async function({ api, message }) {
    try {
      const { messageID, body, senderID, threadID } = message;

      // Ignore if no body or if the message is from the bot itself
      if (!body || !messageID || senderID === api.getCurrentUserID()) return;

      // Cooldown management per thread (2.5 seconds)
      if (!global.autoReactCooldown) global.autoReactCooldown = new Map();
      const lastReact = global.autoReactCooldown.get(threadID) || 0;
      if (Date.now() - lastReact < 2500) return;

      const text = body.toLowerCase();
      let react = null;

      // Emoji matching categories
      const categories = [
        { e: ["😂", "🤣", "😆", "😄", "😁"], r: "😆" },
        { e: ["😭", "😢", "🥺", "💔"], r: "😢" },
        { e: ["❤️", "💖", "💘", "🥰", "😍"], r: "❤️" },
        { e: ["😡", "🤬"], r: "😡" },
        { e: ["😮", "😱", "😲"], r: "😮" },
        { e: ["😎", "🔥", "💯"], r: "😎" },
        { e: ["👍", "👌", "🙏"], r: "👍" },
        { e: ["🖕", "🥒", "👃"], r: "🖕" },
        { e: ["🎉", "🥳"], r: "🎉" }
      ];

      // Keyword matching categories
      const texts = [
        { k: ["haha", "lol", "moja", "xd", "bal"], r: "😆" },
        { k: ["shaan", "shaan khan"], r: "😘" },
        { k: ["love", "valobasi", "miss", "alya", "hinata", "baby", "bot", "jan", "bby"], r: "🥹" },
        { k: ["rag", "angry", "rage"], r: "😡" },
        { k: ["wow", "omg"], r: "😮" },
        { k: ["bot"], r: "❤️" },
        { k: ["ok", "yes", "okay", "hmm"], r: "✅" },
        { k: ["Bot"], r: "❤️" },
        { k: ["cdi", "fuck", "xdi", "fk", "chudi"], r: "🖕" },
        { k: ["hlw", "hellow", "hey"], r: "😸" },
        { k: ["fork", "repo", "repository"], r: "🍴" },
        { k: ["alhamdulillah", "valo", "sweet", "cute", "beautiful"], r: "🥰" },
        { k: ["birthday", "birth", "cake", "happy birthday"], r: "🎂" },
        { k: ["thanks", "tnx", "thank you", "wlc", "welcome"], r: "🦋" },
        { k: ["good night", "night", "gn"], r: "💤" },
        { k: ["good morning", "morning", "gm"], r: "🥱" }
      ];

      // Emoji check
      for (const c of categories) {
        if (c.e.some(x => text.includes(x))) {
          react = c.r;
          break;
        }
      }

      // Keyword check (if no emoji matched)
      if (!react) {
        for (const t of texts) {
          if (t.k.some(x => text.includes(x))) {
            react = t.r;
            break;
          }
        }
      }

      if (react) {
        global.autoReactCooldown.set(threadID, Date.now());
        // Slight delay for a natural feel
        setTimeout(() => {
          api.setMessageReaction(react, messageID, (err) => {
            if (err) global.logger.error(`Autoreact error: ${err}`);
          }, true);
        }, 800);
      }
    } catch (error) {
      global.logger.error(`Error in autoreact event: ${error.message}`);
    }
  }
};