module.exports = {
  config: {
    name: "groupemoji",
    aliases: ["setemoji", "ge"],
    version: "1.0.0",
    description: "Change your group Emoji",
    usage: "{prefix}groupemoji [emoji]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;

    try {
      const emoji = args.join(" ");

      if (!emoji) {
        return api.sendMessage("You have not entered an emoji! 💩", threadID, messageID);
      }

      return api.changeThreadEmoji(emoji, threadID, (err) => {
        if (err) {
          return api.sendMessage("❌ Failed to change emoji. Please make sure you provided a valid emoji.", threadID, messageID);
        }
        return api.sendMessage(`🔨 Shaan Boss mene group emoji Change kar diya hai: ${emoji}`, threadID, messageID);
      });

    } catch (error) {
      global.logger.error(`Error in groupemoji command: ${error.message}`);
      return api.sendMessage("❌ An unexpected error occurred.", threadID, messageID);
    }
  }
};