const fs = require("fs");

module.exports = {
  config: {
    name: "off",
    aliases: [],
    version: "1.0.0",
    description: "Turn off the bot (Owner only)",
    usage: "{prefix}off",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "OWNER",
    cooldown: 0,
    category: "SYSTEM"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    try {
      // Security check: Only allow the owner defined in global config
      if (senderID !== global.config.ownerID) {
        return api.sendMessage("❌ Only the owner can turn off the bot.", threadID, messageID);
      }

      const botName = global.config.BOTNAME || "Bot";
      
      return api.sendMessage(`[ OK ] ${botName} is now turning off...`, threadID, () => {
        global.logger.system("Bot shutdown initiated by owner.");
        process.exit(0);
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in off command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while trying to shut down.", threadID, messageID);
    }
  }
};