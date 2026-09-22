const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "autosetname",
    aliases: [],
    version: "1.0.0",
    description: "Automatic setname for new members",
    usage: "{prefix}autosetname [add <name> / remove]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "ADMIN",
    cooldown: 5,
    category: "SYSTEM"
  },

  init: function () {
    const pathData = path.join(__dirname, "cache", "autosetname.json");
    if (!fs.existsSync(pathData)) {
      fs.writeFileSync(pathData, "[]", "utf-8");
    }
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    const pathData = path.join(__dirname, "cache", "autosetname.json");

    try {
      let dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
      let thisThread = dataJson.find(item => item.threadID == threadID);

      if (!thisThread) {
        thisThread = { threadID, nameUser: "" };
      }

      switch (args[0]) {
        case "add": {
          const content = args.slice(1).join(" ");
          if (!content) return api.sendMessage("❌ Please provide a name template!", threadID, messageID);
          
          thisThread.nameUser = content;
          
          const index = dataJson.findIndex(item => item.threadID == threadID);
          if (index !== -1) dataJson[index] = thisThread;
          else dataJson.push(thisThread);

          fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
          
          // Preview logic
          const userInfo = await api.getUserInfo(senderID);
          const userName = userInfo[senderID].name;
          return api.sendMessage(`✅ Auto-setname configured successfully.\nPreview: ${content} ${userName}`, threadID, messageID);
        }

        case "rm":
        case "remove":
        case "delete": {
          if (!thisThread.nameUser) return api.sendMessage("❌ This group has no auto-setname configuration!", threadID, messageID);
          
          thisThread.nameUser = "";
          const index = dataJson.findIndex(item => item.threadID == threadID);
          if (index !== -1) dataJson[index] = thisThread;

          fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
          return api.sendMessage("✅ Successfully deleted the auto-setname configuration.", threadID, messageID);
        }

        default: {
          return api.sendMessage(`How to use:\n${global.config.prefix}autosetname add <name> - To set nickname\n${global.config.prefix}autosetname remove - To disable`, threadID, messageID);
        }
      }
    } catch (error) {
      global.logger.error(`Error in autosetname: ${error.message}`);
      return api.sendMessage("❌ An error occurred while processing the command.", threadID, messageID);
    }
  },

  handleEvent: async function ({ api, message }) {
    const { threadID, logMessageType, logMessageData } = message;
    const pathData = path.join(__dirname, "cache", "autosetname.json");

    // Check if a new member joined
    if (logMessageType === "log:subscribe") {
      try {
        if (!fs.existsSync(pathData)) return;
        const dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
        const thisThread = dataJson.find(item => item.threadID == threadID);

        if (thisThread && thisThread.nameUser) {
          const { addedParticipants } = logMessageData;
          for (const participant of addedParticipants) {
            const nickname = `${thisThread.nameUser} ${participant.fullName}`;
            api.changeNickname(nickname, threadID, participant.userFbId);
          }
        }
      } catch (error) {
        global.logger.error(`Error in autosetname event: ${error.message}`);
      }
    }
  }
};