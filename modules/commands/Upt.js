const os = require('os');

module.exports = {
  config: {
    name: "upt",
    aliases: ["uptime", "status"],
    version: "1.0.0",
    description: "Display system uptime with dynamic owner name",
    usage: "{prefix}upt",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "SYSTEM"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;

    try {
      const time = process.uptime();
      const hours = Math.floor(time / (60 * 60));
      const minutes = Math.floor((time % (60 * 60)) / 60);
      const seconds = Math.floor(time % 60);

      const currentDate = new Date();

      // Time formatting for Asia/Karachi
      const formattedTime = currentDate.toLocaleTimeString('en-US', { 
        hour12: true, 
        timeZone: 'Asia/Karachi' 
      });
      const formattedDate = currentDate.toLocaleDateString('en-GB', { 
        timeZone: 'Asia/Karachi' 
      });
      const formattedDay = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        timeZone: 'Asia/Karachi' 
      });

      // Dynamic Owner Name Fetching from global config
      const ownerID = global.config.ownerID; 
      let ownerName = "Admin";
      
      try {
          const userInfo = await api.getUserInfo(ownerID);
          ownerName = userInfo[ownerID].name;
      } catch (e) {
          ownerName = "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭"; // Fallback name
      }

      const totalCommands = global.client.commands.size;

      const responseMessage = `╭─────────────────────────────╮\n` +
                              `│        🎉 ✧ 𝗨𝗣𝗧𝗜𝗠𝗘 ✧ 😉  │\n` +
                              `╰─────────────────────────────╯\n\n` +
                              `✰ 𝗥𝗨𝗡 ➪ ${hours}ʜ ${minutes}ᴍ ${seconds}ꜱ ✅\n` +
                              `✰ 𝗧𝗜𝗠𝗘 ➪ ${formattedTime} ⏰\n` +
                              `✰ 𝗗𝗔𝗧𝗘 ➪ ${formattedDate} 📅\n` +
                              `✰ 𝗗𝗔𝗬 ➪ ${formattedDay} 🗓️\n` +
                              `✰ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 ➪ ${totalCommands} 📊\n` +
                              `✰ 𝗢𝘄𝗻𝗲𝗿 ➪ ${ownerName} 👑\n\n` +
                              `┗━━━━━━━━━━━━━━━━━━━━━━━┛\n` +
                              `𝗠𝗔𝗗𝗘 𝗕𝗬 ❤️‍🔥 𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭`;

      return api.sendMessage(responseMessage, threadID, messageID);
    } catch (error) {
      global.logger.error(`Error in upt command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while fetching uptime.", threadID, messageID);
    }
  }
};