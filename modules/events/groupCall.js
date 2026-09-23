const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "adminupdate",
    aliases: ["groupupdate", "log"],
    version: "1.0.0",
    description: "Group ki sabhi activities aur calls ko track karta hai",
    usage: "Automated - No command needed",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 0,
    category: "SYSTEM"
  },

  handleEvent: async function({ api, message }) {
    const { threadID, logMessageType, logMessageData, logMessageBody, author } = message;
    
    // Bot ke apne actions ko ignore karein
    if (!logMessageType || author == api.getCurrentUserID()) return;

    const cacheDir = path.join(__dirname, "cache");
    const iconPath = path.join(cacheDir, "emoji.json");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));

    try {
      switch (logMessageType) {
        // --- ADMIN UPDATES ---
        case "log:thread-admins": {
          if (logMessageData.ADMIN_EVENT == "add_admin") {
            return api.sendMessage(`[⚜️] Breaking News [⚜️]\n» Dil Dehla Dene wali News: UID ${logMessageData.TARGET_ID} Ko Admin Bana Diya Gaya😒👈🏻`, threadID);
          } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
            return api.sendMessage(`[⚜️] Breaking News [⚜️]\n• Bechare ko admin se remove Kardiya☹️ UID: ${logMessageData.TARGET_ID}`, threadID);
          }
          break;
        }

        // --- NICKNAME UPDATES ---
        case "log:user-nickname": {
          const nickname = logMessageData.nickname;
          const targetID = logMessageData.participant_id;
          return api.sendMessage(`[⚜️] Update [⚜️]\n» ${(nickname.length == 0) ? `USER KA NAME REMOVE KAR DIYA GAYA: ${targetID}` : `NICKNAME UPDATE: ${targetID} -> ${nickname}`}.`, threadID);
        }

        // --- GROUP NAME UPDATES ---
        case "log:thread-name": {
          const name = logMessageData.name || "None";
          return api.sendMessage(`[⚜️] UPDATE GROUP NAME [⚜️]\n» ${(name !== "None") ? `NEW GROUP NAME: ${name}` : 'GROUP NAME REMOVE KAR DIYA GAYA'}.`, threadID);
        }

        // --- GROUP ICON/EMOJI UPDATES ---
        case "log:thread-icon": {
          let preIcon = JSON.parse(fs.readFileSync(iconPath));
          const newIcon = logMessageData.thread_icon || "🤦🏻‍♂️";
          api.sendMessage(`[⚜️] Aj ki Taaza Khabar [⚜️]\n» ${logMessageBody.replace("emoticon", "icon")}\n» Original Icon: ${preIcon[threadID] || "unclear"}`, threadID);
          preIcon[threadID] = newIcon;
          fs.writeFileSync(iconPath, JSON.stringify(preIcon));
          break;
        }

        // --- CALL UPDATES (AUDIO/VIDEO) ---
        case "log:thread-call": {
          const callType = logMessageData.video ? "VIDEO" : "AUDIO";
          
          // Call Started
          if (logMessageData.event == "group_call_started") {
            const userInfo = await api.getUserInfo(logMessageData.caller_id);
            const name = userInfo[logMessageData.caller_id].name;
            return api.sendMessage(`❯❯❯⭑ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 ⭑❮❮❮\n᯽───────────────᯽\n👤 User: ${name}\n᯽───────────────᯽\n⭑｟ 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 𝐀 ${callType} 𝐂𝐀𝐋𝐋 ｠⭑`, threadID);
          } 
          
          // Participant Joined
          else if (logMessageData.event == "group_call_participant_joined" || logMessageData.joining_user) {
            const userID = logMessageData.joining_user || logMessageData.caller_id;
            const userInfo = await api.getUserInfo(userID);
            const name = userInfo[userID].name;
            return api.sendMessage(`📞 [CALL JOIN] ${name} has joined the ${callType} call.`, threadID);
          }
          
          // Call Ended
          else if (logMessageData.event == "group_call_ended") {
            const callDuration = logMessageData.call_duration;
            let hours = Math.floor(callDuration / 3600);
            let minutes = Math.floor((callDuration - (hours * 3600)) / 60);
            let seconds = callDuration - (hours * 3600) - (minutes * 60);
            const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            return api.sendMessage(`❯❯❯⭑ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 ⭑❮❮❮\n» ${callType} CALL ENDED.\n» DURATION: ${timeFormat}`, threadID);
          }
          break;
        }

        // --- THEME & MAGIC WORDS ---
        case "log:magic-words": {
          return api.sendMessage(`[⚜️] Theme ${logMessageData.magic_word} added effects: ${logMessageData.theme_name}\n[⚜️] Emoji: ${logMessageData.emoji_effect || "No emoji"}`, threadID);
        }

        // --- POLL UPDATES ---
        case "log:thread-poll": {
          return api.sendMessage(`[⚜️] Poll Update: ${logMessageBody}`, threadID);
        }

        // --- APPROVAL MODE ---
        case "log:thread-approval-mode": {
          return api.sendMessage(`[⚜️] Approval Mode: ${logMessageBody}`, threadID);
        }

        // --- COLOR/THEME UPDATES ---
        case "log:thread-color": {
          return api.sendMessage(`[⚜️] UPDATE GROUP COLOR [⚜️]\n» ${logMessageBody.replace("Topic", "color")}`, threadID);
        }
      }
    } catch (error) {
      global.logger.error(`Error in adminUpdate: ${error.message}`);
    }
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    try {
      return api.sendMessage("Yeh command group activities aur calls ko auto-detect karti hai. Iska koi manual use nahi hai.", threadID, messageID);
    } catch (e) {
      global.logger.error(e.message);
    }
  }
};