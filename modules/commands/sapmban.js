const num = 10; // Number of times spam gets banned
const timee = 120; // Time window in seconds

module.exports = {
  config: {
    name: "spamban",
    aliases: [],
    version: "1.0.0",
    description: "Automatically ban users if they spam commands",
    usage: "{prefix}spamban",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "SYSTEM"
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    return api.sendMessage(`🛡️ Spam Detection Active: Users will be automatically banned if they spam commands more than ${num} times within ${timee} seconds.`, threadID, messageID);
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, senderID, body } = message;

    try {
      // Initialize autoban tracking object if it doesn't exist
      if (!global.client.autoban) global.client.autoban = new Map();

      // Get the current prefix
      const threadData = await global.Thread.getData(threadID) || {};
      const prefix = threadData.prefix || global.config.prefix;

      // Only track messages that start with the prefix (command spam)
      if (!body || !body.startsWith(prefix)) return;

      if (!global.client.autoban.has(senderID)) {
        global.client.autoban.set(senderID, {
          timeStart: Date.now(),
          count: 1
        });
        return;
      }

      const userData = global.client.autoban.get(senderID);
      const currentTime = Date.now();

      // Reset tracker if the time window has passed
      if (currentTime - userData.timeStart > timee * 1000) {
        global.client.autoban.set(senderID, {
          timeStart: currentTime,
          count: 1
        });
      } else {
        userData.count++;
        
        if (userData.count >= num) {
          // Get user and thread info for the report
          const info = await api.getUserInfo(senderID);
          const name = info[senderID]?.name || "Facebook User";
          const threadInfo = await api.getThreadInfo(threadID);
          const threadName = threadInfo.threadName || "Unknown Group";

          // Check if already banned to avoid redundant processing
          const userDB = await global.User.getData(senderID);
          if (userDB && userDB.isBanned) return;

          // Ban the user in the database
          await global.User.setData(senderID, {
            isBanned: true,
            banReason: `Spamming commands ${num} times in ${timee}s`
          });

          // Reset tracker after ban
          global.client.autoban.delete(senderID);

          // Notify the group
          api.sendMessage({
            body: `🛡️ User Banned for Spamming!\n\nName: ${name}\nID: ${senderID}\nReason: Exceeded command limit (${num} msgs / ${timee}s)\n\nReported to Bot Admins.`
          }, threadID, messageID);

          // Notify Admins
          const adminIDs = global.config.adminIDs || [];
          const reportMsg = `⚠️ [SPAM ALERT] ⚠️\n\nUser: ${name}\nID: ${senderID}\nGroup: ${threadName}\nGroupID: ${threadID}\nAction: Automatically Banned`;
          
          for (const adminID of adminIDs) {
            api.sendMessage(reportMsg, adminID);
          }
          
          // Also notify owner
          if (global.config.ownerID && !adminIDs.includes(global.config.ownerID)) {
            api.sendMessage(reportMsg, global.config.ownerID);
          }
        }
      }
    } catch (error) {
      global.logger.error(`Error in spamban handleEvent: ${error.message}`);
    }
  }
};