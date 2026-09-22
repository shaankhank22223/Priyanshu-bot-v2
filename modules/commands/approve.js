const axios = require("axios");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "cache", "approvedThreads.json");
const dataPending = path.join(__dirname, "cache", "pendingThreads.json");

// Helper to ensure files exist
function checkDataFiles() {
  if (!fs.existsSync(path.join(__dirname, "cache"))) {
    fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
  }
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));
  if (!fs.existsSync(dataPending)) fs.writeFileSync(dataPending, JSON.stringify([]));
}

module.exports = {
  config: {
    name: "approve",
    aliases: ["app", "auth"],
    version: "1.0.0",
    description: "Approve or remove threads for bot usage",
    usage: "{prefix}approve [list/pending/del/help/ID]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "ADMIN",
    cooldown: 5,
    category: "ADMIN"
  },

  init: function (api) {
    checkDataFiles();
    global.logger.system("Approve command initialized");
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    checkDataFiles();

    try {
      let data = JSON.parse(fs.readFileSync(dataPath));
      let dataP = JSON.parse(fs.readFileSync(dataPending));
      let msg = "";
      let idBox = args[0] ? args[0] : threadID;

      // --- SUBCOMMAND: LIST ---
      if (args[0] == "list" || args[0] == "l") {
        msg = `=====「 APPROVED GROUPS: ${data.length} 」 ====`;
        let count = 0;
        for (const e of data) {
          try {
            const threadInfo = await api.getThreadInfo(e);
            msg += `\n〘${count += 1}〙» ${threadInfo.threadName || "Unknown Group"}\nID: ${e}`;
          } catch (err) {
            msg += `\n〘${count += 1}〙» Deleted/Unknown Group\nID: ${e}`;
          }
        }
        return api.sendMessage(msg, threadID, messageID);
      }

      // --- SUBCOMMAND: PENDING ---
      else if (args[0] == "pending" || args[0] == "p") {
        msg = `=====「 PENDING APPROVAL: ${dataP.length} 」 ====`;
        let count = 0;
        for (const e of dataP) {
          try {
            const threadInfo = await api.getThreadInfo(e);
            msg += `\n〘${count += 1}〙» ${threadInfo.threadName || "Unknown Group"}\nID: ${e}`;
          } catch (err) {
            msg += `\n〘${count += 1}〙» ID: ${e}`;
          }
        }
        msg += `\n\nReply to this message with 'A' to approve the current thread or enter a specific ID to approve it.`;
        
        return api.sendMessage(msg, threadID, (err, info) => {
          const replies = global.client.replies.get(threadID) || [];
          replies.push({
            command: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "pending"
          });
          global.client.replies.set(threadID, replies);
        }, messageID);
      }

      // --- SUBCOMMAND: HELP ---
      else if (args[0] == "help" || args[0] == "h") {
        const prefix = global.config.prefix;
        return api.sendMessage(
          `=====「 APPROVE SYSTEM 」=====\n\n` +
          `${prefix}approve l/list -> View approved list\n` +
          `${prefix}approve p/pending -> View pending list\n` +
          `${prefix}approve d/del [ID] -> Remove approval\n` +
          `${prefix}approve [ID] -> Approve specific group`,
          threadID, messageID
        );
      }

      // --- SUBCOMMAND: DELETE ---
      else if (args[0] == "del" || args[0] == "d") {
        idBox = args[1] ? args[1] : threadID;
        if (isNaN(parseInt(idBox))) return api.sendMessage("❌ Invalid ID format.", threadID, messageID);
        if (!data.includes(idBox)) return api.sendMessage("❌ This group is not in the approved list.", threadID, messageID);

        data.splice(data.indexOf(idBox), 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        
        api.sendMessage(`[ OK ] This group has been removed from the approved list by Admin.`, idBox);
        return api.sendMessage(`[ OK ] Successfully removed ID: ${idBox} from approved list.`, threadID, messageID);
      }

      // --- ACTION: DIRECT APPROVAL ---
      else {
        if (isNaN(parseInt(idBox))) return api.sendMessage("❌ Please provide a valid Thread ID.", threadID, messageID);
        if (data.includes(idBox)) return api.sendMessage(`⚠️ ID ${idBox} is already approved.`, threadID, messageID);

        // Success Approval Logic
        const approveMsg = `💐 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐒𝐇𝐀𝐀𝐍 𝐁𝐎𝐓 💐\n\nYour group has been APPROVED by the Admin.\n\nOwner: 𝐌𝐑.𝐒𝐇𝐀𝐀𝐍\nID: ${idBox}\n\nType ${global.config.prefix}help to see commands.`;
        
        api.sendMessage(approveMsg, idBox, (error) => {
          if (error) return api.sendMessage("❌ Error: Could not send message to that ID. Is the bot in that group?", threadID, messageID);
          
          data.push(idBox);
          fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
          
          // Remove from pending if exists
          if (dataP.includes(idBox)) {
            dataP.splice(dataP.indexOf(idBox), 1);
            fs.writeFileSync(dataPending, JSON.stringify(dataP, null, 2));
          }

          return api.sendMessage(`✅ Successfully Approved Thread ID: ${idBox}`, threadID, messageID);
        });
      }
    } catch (error) {
      global.logger.error(`Error in approve command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while processing approval.", threadID, messageID);
    }
  },

  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, senderID, body } = message;
    const { author, type } = replyData;

    if (senderID !== author) return;

    try {
      let data = JSON.parse(fs.readFileSync(dataPath));
      let dataP = JSON.parse(fs.readFileSync(dataPending));

      if (type === "pending") {
        if (body.toLowerCase() === "a") {
          const idToApprove = threadID;
          
          if (data.includes(idToApprove)) return api.sendMessage("⚠️ This thread is already approved.", threadID, messageID);

          data.push(idToApprove);
          if (dataP.includes(idToApprove)) {
            dataP.splice(dataP.indexOf(idToApprove), 1);
          }

          fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
          fs.writeFileSync(dataPending, JSON.stringify(dataP, null, 2));

          return api.sendMessage(`✅ Successfully Approved this group! You can now use the bot here.`, threadID, messageID);
        }
      }
    } catch (error) {
      global.logger.error(`Error in approve handleReply: ${error.message}`);
    }
  }
};