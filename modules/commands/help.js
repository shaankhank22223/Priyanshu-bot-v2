const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "cmds", "commands"],
    version: "1.0.0",
    description: "Shows the list of available commands or detailed info of a specific command.",
    usage: "{prefix}help [all | page | command name]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "SYSTEM"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;
    const prefix = global.config.prefix;
    const commands = global.client.commands;

    // Ensure cache directory exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    try {
      // 1. Logic for "help all"
      if (args[0] === "all") {
        let msg = "𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗟𝗶𝘀𝘁 (𝗔𝗹𝗹)\n\n";
        const categories = {};

        commands.forEach((cmd) => {
          const cat = (cmd.config.category || "GENERAL").toUpperCase();
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd.config.name);
        });

        for (const cat in categories) {
          msg += `☂︎ ${cat}\n${categories[cat].join(" • ")}\n\n`;
        }

        msg += `Total Commands: ${commands.size}\nDeveloper: 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍`;
        
        const imgUrl = "https://i.imgur.com/WW1nVy9.jpeg";
        const cachePath = path.join(cacheDir, `help_all_${Date.now()}.jpg`);
        
        try {
          const getImg = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(cachePath, Buffer.from(getImg));
          return api.sendMessage({ body: msg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          }, messageID);
        } catch (imgError) {
          return api.sendMessage(msg, threadID, messageID);
        }
      }

      // 2. Logic for specific command info
      if (args[0] && isNaN(args[0])) {
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));

        if (!command) {
          return api.sendMessage(`❌ Command "${commandName}" not found.`, threadID, messageID);
        }

        const config = command.config;
        const msg = `─────[ ${config.name.toUpperCase()} ]──────\n\n` +
          `📝 Description: ${config.description}\n` +
          `🎮 Usage: ${config.usage.replace("{prefix}", prefix)}\n` +
          `📁 Category: ${config.category}\n` +
          `⏳ Cooldown: ${config.cooldown}s\n` +
          `🔑 Permission: ${config.permission}\n\n` +
          `Module coded by: ${config.credit}`;

        const imgLinks = ["https://i.imgur.com/9JZobiR.jpeg", "https://i.imgur.com/G2msKfY.jpeg"];
        const randomImg = imgLinks[Math.floor(Math.random() * imgLinks.length)];
        const cachePath = path.join(cacheDir, `help_cmd_${Date.now()}.jpg`);
        
        try {
          const getImg = (await axios.get(randomImg, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(cachePath, Buffer.from(getImg));
          return api.sendMessage({ body: msg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
          }, messageID);
        } catch (imgError) {
          return api.sendMessage(msg, threadID, messageID);
        }
      }

      // 3. Logic for Paginated Command List
      const page = parseInt(args[0]) || 1;
      const commandsPerPage = 15;
      const allCmds = Array.from(commands.keys()).sort();
      const totalPages = Math.ceil(allCmds.length / commandsPerPage);

      if (page > totalPages || page < 1) {
        return api.sendMessage(`❌ Invalid page. Total pages: ${totalPages}`, threadID, messageID);
      }

      let msg = "★ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗟𝗶𝘀𝘁 ★\n\n";
      const start = (page - 1) * commandsPerPage;
      const end = start + commandsPerPage;
      const pageCmds = allCmds.slice(start, end);

      pageCmds.forEach((name, index) => {
        msg += `「 ${start + index + 1} 」📂 ${prefix}${name}\n`;
      });

      msg += `\n𝐏𝐀𝐆𝐄 (${page}/${totalPages})\n`;
      msg += `Type "${prefix}help [name]" for details.\n`;
      msg += `Type "${prefix}help all" for all commands.\n\n`;
      msg += `★᭄ 𝐂𝐫𝐞𝐝𝐢𝐭'𝐬: 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍 ★`;

      const listImg = "https://i.imgur.com/WW1nVy9.jpeg";
      const cachePath = path.join(cacheDir, `help_list_${Date.now()}.jpg`);
      
      try {
        const getImg = (await axios.get(listImg, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(cachePath, Buffer.from(getImg));
        return api.sendMessage({ body: msg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);
      } catch (imgError) {
        return api.sendMessage(msg, threadID, messageID);
      }

    } catch (error) {
      global.logger.error(`Error in help command: ${error.message}`);
      return api.sendMessage("❌ An error occurred while generating the help menu. Check console for details.", threadID, messageID);
    }
  }
};