const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "adminupdate",
    aliases: [],
    version: "1.0.0",
    description: "Group ki activities aur updates ko track karta hai",
    usage: "Automated - No command needed",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 0,
    category: "SYSTEM"
  },

  handleEvent: async function({ api, message }) {
    const { threadID, logMessageType, logMessageData, logMessageBody, author } = message;
    
    // Sirf log messages par kaam karega
    if (!logMessageType) return;
    if (author == api.getCurrentUserID()) return;

    const iconPath = path.join(__dirname, "cache", "emoji.json");
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
    if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));

    try {
      switch (logMessageType) {
        case "log:thread-admins": {
          if (logMessageData.ADMIN_EVENT == "add_admin") {
            return api.sendMessage(`[⚜️] Breaking News [⚜️]\n» Dil Dehla Dene wali News: UID ${logMessageData.TARGET_ID} Ko Admin Bana Diya Gaya😒👈🏻`, threadID);
          } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
            return api.sendMessage(`[⚜️] Breaking News [⚜️]\n• Bechare ko admin se remove Kardiya☹️ UID: ${logMessageData.TARGET_ID}`, threadID);
          }
          break;
        }

        case "log:user-nickname": {
          const nickname = logMessageData.nickname;
          return api.sendMessage(`[⚜️] Update [⚜️]\n» ${(nickname.length == 0) ? `USER KA NAME REMOVE KAR DIYA GAYA: ${logMessageData.participant_id}` : `NICKNAME UPDATE: ${logMessageData.participant_id} -> ${nickname}`}.`, threadID);
        }

        case "log:thread-name": {
          const name = logMessageData.name || "None";
          return api.sendMessage(`[⚜️] UPDATE GROUP NAME [⚜️]\n» ${(name !== "None") ? `NEW GROUP NAME: ${name}` : 'GROUP NAME REMOVE KAR DIYA GAYA'}.`, threadID);
        }

        case "log:thread-icon": {
          let preIcon = JSON.parse(fs.readFileSync(iconPath));
          const newIcon = logMessageData.thread_icon || "🤦🏻‍♂️";
          api.sendMessage(`[⚜️] Aj ki Taaza Khabar [⚜️]\n» ${logMessageBody.replace("emoticon", "icon")}\n» Original Icon: ${preIcon[threadID] || "unclear"}`, threadID);
          preIcon[threadID] = newIcon;
          fs.writeFileSync(iconPath, JSON.stringify(preIcon));
          break;
        }

        case "log:thread-call": {
          if (logMessageData.event == "group_call_started") {
            const userInfo = await api.getUserInfo(logMessageData.caller_id);
            const name = userInfo[logMessageData.caller_id].name;
            return api.sendMessage(`❯❯❯⭑ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 ⭑❮❮❮\n᯽───────────────᯽\n👤 User: ${name}\n᯽───────────────᯽\n⭑｟ 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 𝐀 ${(logMessageData.video) ? '𝐕𝐈𝐃𝐄𝐎' : ''} 𝐂𝐀𝐋𝐋 ｠⭑`, threadID);
          } else if (logMessageData.event == "group_call_ended") {
            const callDuration = logMessageData.call_duration;
            let hours = Math.floor(callDuration / 3600);
            let minutes = Math.floor((callDuration - (hours * 3600)) / 60);
            let seconds = callDuration - (hours * 3600) - (minutes * 60);
            const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            return api.sendMessage(`❯❯❯⭑ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 ⭑❮❮❮\n» ${(logMessageData.video) ? '𝐕𝐈𝐃𝐄𝐎 ' : ''}CALL ENDED.\n» DURATION: ${timeFormat}`, threadID);
          }
          break;
        }

        case "log:magic-words": {
          return api.sendMessage(`[⚜️] Theme ${logMessageData.magic_word} added effects: ${logMessageData.theme_name}\n[⚜️] Emoji: ${logMessageData.emoji_effect || "No emoji"}`, threadID);
        }

        case "log:thread-poll": {
          return api.sendMessage(`${logMessageBody}`, threadID);
        }

        case "log:thread-approval-mode": {
          return api.sendMessage(logMessageBody, threadID);
        }

        case "log:thread-color": {
          return api.sendMessage(`[⚜️] UPDATE GROUP COLOR [⚜️]\n» ${logMessageBody.replace("Topic", "color")}`, threadID);
        }
      }
    } catch (error) {
      global.logger.error(`Error in adminUpdate: ${error.message}`);
    }
  },

  run: async function({ api, message }) {
    // Ye function khali rahega kyunki logic handleEvent mein hai
    return api.sendMessage("Yeh command group activities ko auto-detect karta hai.", message.threadID);
  }
};