const fs = require("fs");

module.exports = {
  config: {
    name: "help2",
    aliases: ["commands", "menu"],
    version: "1.0.0",
    description: "Beginner's Guide To All Bot Commands",
    usage: "{prefix}help2 [command name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 7,
    category: "SYSTEM"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;
    const { commands } = global.client;
    const prefix = global.config.prefix;

    try {
      // If no command name is provided, show the full list
      if (!args[0]) {
        const arrayInfo = [];
        let i = 0;
        let msg = "";

        for (const [name, value] of commands) {
          arrayInfo.push(name);
        }

        arrayInfo.sort();

        for (const item of arrayInfo) {
          msg += `『 ${++i} 』${prefix}${item}❣️\n`;
        }

        const header = `╔━━❖❖💠❖❖━━╗\n 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍 𝐀𝐥𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭\n╚━━❖❖💠❖❖━━╝`;
        const footer = `\nPage (1/1)\nUse ${prefix}help2 [name] to see details.`;

        return api.sendMessage(header + "\n\n" + msg + footer, threadID, messageID);
      }

      // If a command name is provided, show specific info
      const command = commands.get(args[0].toLowerCase()) || commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(args[0].toLowerCase()));

      if (!command) {
        return api.sendMessage(`❌ Command "${args[0]}" not found.`, threadID, messageID);
      }

      const config = command.config;
      const infoMsg = `「 ${config.name.toUpperCase()} 」\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `❯ Description: ${config.description || "No description"}\n` +
        `❯ Usage: ${config.usage.replace(/{prefix}/g, prefix)}\n` +
        `❯ Category: ${config.category}\n` +
        `❯ Waiting time: ${config.cooldown}s\n` +
        `❯ Permission: ${config.permission}\n\n` +
        `» Module code by ${config.credit} «`;

      return api.sendMessage(infoMsg, threadID, messageID);

    } catch (error) {
      global.logger.error(`Error in help2 command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while generating the command list.", threadID, messageID);
    }
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, body } = message;
    const prefix = global.config.prefix;

    if (!body || !body.startsWith("help2")) return;

    // This handles the logic if someone types "help2 [command]" without a prefix 
    // even though hasPrefix is true (optional behavior mimic from your original code)
    const splitBody = body.split(/\s+/);
    if (splitBody.length <= 1) return;

    const commandName = splitBody[1].toLowerCase();
    const command = global.client.commands.get(commandName);

    if (command) {
      const config = command.config;
      const infoMsg = `「 ${config.name.toUpperCase()} 」\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `❯ Description: ${config.description}\n` +
        `❯ Usage: ${config.usage.replace(/{prefix}/g, prefix)}\n` +
        `❯ Category: ${config.category}\n` +
        `❯ Waiting time: ${config.cooldown}s\n` +
        `❯ Permission: ${config.permission}\n\n` +
        `» Module code by ${config.credit} «`;
        
      return api.sendMessage(infoMsg, threadID, messageID);
    }
  }
};