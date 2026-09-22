const fs = require("fs");

module.exports = {
  config: {
    name: "goiadmin",
    aliases: ["mentionadmin", "tagadmin"],
    version: "1.0.0",
    description: "Bot will reply when the admin is mentioned.",
    usage: "{prefix}goiadmin",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, senderID, mentions } = message;

    try {
      // Define the Admin ID to watch for
      const adminID = "100016828397863";

      // If the message is from the admin themselves, don't trigger
      if (senderID === adminID) return;

      // Check if there are mentions in the message
      if (mentions && Object.keys(mentions).length > 0) {
        const mentionedIDs = Object.keys(mentions);

        // Check if our specific adminID is among the mentioned IDs
        if (mentionedIDs.includes(adminID)) {
          const msgList = [
            "𝐘𝐀𝐑 𝐒𝐇𝐀𝐀𝐍 𝐊𝐎 𝐌𝐄𝐍𝐓𝐈𝐎𝐍 𝐌𝐀𝐓 𝐊𝐀𝐑𝐎 𝐁𝐔𝐑𝐀 𝐌𝐀𝐍 𝐉𝐀𝐘𝐄 𝐆𝐀😏",
            "𝐃𝐨𝐨𝐑 𝐇𝐚𝐚𝐓 𝐉𝐚𝐨 𝐌𝐞𝐑𝐞 𝐁𝐨𝐬𝐒 𝐒𝐞 𝐊𝐲𝐔 𝐁𝐨𝐋𝐚 𝐑𝐞𝐇 𝐇𝐨 𝐔𝐧𝐊𝐨 🤨",
            "𝐖𝐨 𝐁𝐮𝐒𝐲 𝐇 𝐌𝐮𝐣𝐇𝐞 𝐁𝐨𝐋𝐨 𝐊𝐲𝐀 𝐁𝐨𝐥𝐍𝐚 𝐇?🤨",
            "𝐊𝐲𝐀 𝐇𝐮𝐚 𝐦𝐞𝐫𝐢 𝐣𝐚𝐚𝐧 𝐊𝐨 𝐐 𝐁𝐨𝐋𝐚 𝐑𝐞𝐡 𝐇𝐨 𝐬𝐚𝐥𝐞 𝐭𝐮𝐦 𝐬𝐚𝐛 𝐤𝐢 𝐢𝐝 𝐮𝐝𝐚 𝐝𝐮𝐧𝐠𝐚?🤨",
            "𝐖𝐨 𝐒𝐡𝐘𝐚𝐃 𝐁𝐮𝐒𝐲 𝐇𝐨𝐆𝐞🤨",
            "𝐁𝐨 𝐁𝐮𝐒𝐲 𝐇𝐚𝐢 𝐀𝐛𝐇𝐢 𝐀𝐩𝐍𝐞 𝐖𝐨𝐑𝐤 𝐌𝐚𝐢 𝐌𝐮𝐣𝐇𝐞 𝐁𝐨𝐋 𝐃𝐨 𝐌𝐚𝐢 𝐁𝐨𝐋 𝐃𝐮𝐧𝐆𝐢 𝐁𝐨𝐬𝐒 𝐊𝐨 🤨",
            "𝐁𝐨𝐬𝐬 𝐊𝐨 𝐊𝐲𝐮 𝐁𝐮𝐥𝐚 𝐑𝐚𝐡𝐞 𝐇𝐨 𝐏𝐚𝐠𝐚𝐥 𝐇𝐨 𝐊𝐲𝐚😏"
          ];

          const randomReply = msgList[Math.floor(Math.random() * msgList.length)];
          return api.sendMessage(randomReply, threadID, messageID);
        }
      }
    } catch (error) {
      global.logger.error(`Error in goiadmin: ${error.message}`);
    }
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    return api.sendMessage("This command is automatically active when you tag the Admin.", threadID, messageID);
  }
};