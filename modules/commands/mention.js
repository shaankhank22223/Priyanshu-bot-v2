const fs = require("fs");

// Simple object to prevent spam/multiple triggers in the same thread
const lastTriggered = new Map();

module.exports = {
  config: {
    name: "goiadmin",
    aliases: ["mentionadmin", "tagadmin"],
    version: "1.0.0",
    description: "Bot will reply when the admin is mentioned once.",
    usage: "{prefix}goiadmin",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, senderID, mentions, type } = message;

    try {
      // Ensure it only reacts to actual messages or replies, not read receipts or other events
      if (type !== "message" && type !== "message_reply") return;

      // Define the Admin ID
      const adminID = "100016828397863";

      // Don't trigger if admin mentions themselves
      if (senderID === adminID) return;

      // Check if admin is mentioned
      if (mentions && Object.keys(mentions).includes(adminID)) {
        
        // Anti-multi-reply logic: Check if we replied in this thread in the last 2 seconds
        const now = Date.now();
        if (lastTriggered.has(threadID) && (now - lastTriggered.get(threadID) < 2000)) {
          return;
        }

        const msgList = [
          "𝐘𝐀𝐑 𝐒𝐇𝐀𝐀𝐍 𝐊𝐎 𝐌𝐄𝐍𝐓𝐈𝐎𝐍 𝐌𝐀𝐓 𝐊𝐀𝐑𝐎 𝐁𝐔𝐑𝐀 𝐌𝐀𝐍 𝐉𝐀𝐘𝐄 𝐆𝐀😏",
          "𝐃𝐨𝐨𝐑 𝐇𝐚𝐚𝐓 𝐉𝐚𝐨 𝐌𝐞𝐑𝐞 𝐁𝐨𝐬𝐒 𝐒𝐞 𝐊𝐲𝐔 𝐁𝐨𝐋𝐚 𝐑𝐞𝐇 𝐇𝐨 𝐔𝐧𝐊𝐨 🤨",
          "𝐖𝐨 𝐁𝐮𝐒𝐲 𝐇 𝐌𝐮𝐣𝐇𝐞 𝐁𝐨𝐋𝐨 𝐊𝐲𝐀 𝐁𝐨𝐥𝐍𝐚 𝐇?🤨",
          "𝐊𝐲𝐀 𝐇𝐮𝐚 𝐦𝐞𝐫𝐢 𝐣𝐚𝐚𝐧 𝐊𝐨 𝐐 𝐁𝐨𝐋𝐚 𝐑𝐞𝐡 𝐇𝐨 𝐬𝐚𝐥𝐞 𝐭𝐮𝐦 𝐬𝐚𝐛 𝐤𝐢 𝐢𝐝 𝐮𝐝𝐚 𝐝𝐮𝐧𝐠𝐚?🤨",
          "𝐖𝐨 𝐒𝐡𝐘𝐚𝐃 𝐁𝐮𝐒𝐲 𝐇𝐆𝐞🤨",
          "𝐁𝐨 𝐁𝐮𝐒𝐲 𝐇𝐚𝐢 𝐀𝐛𝐇𝐢 𝐀𝐩𝐍𝐞 𝐖𝐨𝐑𝐤 𝐌𝐚𝐢 𝐌𝐮𝐣𝐇𝐞 𝐁𝐨𝐋 𝐃𝐨 𝐌𝐚𝐢 𝐁𝐨𝐋 𝐃𝐮𝐧𝐆𝐢 𝐁𝐨𝐬𝐒 𝐊𝐨 🤨",
          "𝐁𝐨𝐬𝐬 𝐊𝐨 𝐊𝐲𝐮 𝐁𝐮𝐥𝐚 𝐑𝐚𝐡𝐞 𝐇𝐨 𝐏𝐚𝐠𝐚𝐥 𝐇𝐨 𝐊𝐲𝐚😏"
        ];

        const randomReply = msgList[Math.floor(Math.random() * msgList.length)];
        
        // Update the last triggered time for this thread
        lastTriggered.set(threadID, now);

        return api.sendMessage(randomReply, threadID, messageID);
      }
    } catch (error) {
      global.logger.error(`Error in goiadmin: ${error.message}`);
    }
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    return api.sendMessage("This command is automatically active when you tag the Admin. It is now fixed to reply only once.", threadID, messageID);
  }
};