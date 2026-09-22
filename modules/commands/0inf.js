const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    aliases: ["info", "status"],
    version: "1.0.0",
    description: "Bot info aur system status check karne ke liye.",
    usage: "{prefix}inf",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "SYSTEM"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID } = message;

    try {
      // Uptime calculation
      const time = process.uptime();
      const hours = Math.floor(time / (60 * 60));
      const minutes = Math.floor((time % (60 * 60)) / 60);
      const seconds = Math.floor(time % 60);

      // Time and Date in Asia/Karachi
      const juswa = moment.tz("Asia/Karachi").format("『D/MM/YYYY』 【HH:mm:ss】");

      // Image links
      const links = [
        "https://i.ibb.co/p64MMvQ5/f0d96d5b9e1b.jpg",
        "https://i.ibb.co/Fq4dtrXd/860aa021ba88.jpg",
        "https://i.ibb.co/5WmcxmBB/ef5270183c4f.jpg",
        "https://i.ibb.co/jk1dBL3w/56f368877445.jpg"
      ];

      const cachePath = path.join(__dirname, "cache", `inf_${Date.now()}.jpg`);
      const randomImg = links[Math.floor(Math.random() * links.length)];

      // Ensure cache directory exists
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"));
      }

      // Image download using axios
      const response = await axios.get(randomImg, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));

      const botName = global.config.BOTNAME || "Messenger Bot";
      const prefix = global.config.prefix || "#";

      const msgBody = `╭━☆━╮\n🇵🇰 𝐀𝐃𝐌𝐈𝐍 𝐀𝐍𝐃 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 🇵🇰\n╰━☆━╯\n\n🤖☾︎𝗕𝗢𝗧 𝗡𝗔𝗠𝗘☽︎🤖 ${botName}\n══════════════════\n\n🔥𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡 シ︎🔥\n☞︎︎︎ 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍 💔🥀\n══════════════════\n\n♥︎═════•❁❀❁•═════♥︎\n\n🌸𝔹𝕆𝕋 ℙℝ𝔼𝔽𝕀𝕏 🌸: ${prefix}\n♥️𝔹𝕆𝕋 𝕆𝕎ℕ𝔼ℝ♥️: 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍\n❤︎═════•❁❀❁•═════❤︎\n\n🕒 𝚄𝙿 𝚃𝙸𝙼𝙴 🕒\n\n🌪️Today is🌪️\n╔════════════════╗\n ${juswa}\n╚════════════════╝\n\n⚡ 𝘽𝙊𝙏 𝙄𝙎 𝙍𝙐𝙉𝙄𝙉𝙄𝙂 ⚡\n╭──🌟━━━━━━━━━━━━🌟──╮\n    ${hours}h ${minutes}m ${seconds}s\n╰──🌟━━━━━━━━━━━━🌟──╯\n\n✅ Thanks for using ${botName}\n\n🎀💞 𝗕𝗼𝘁 𝗢𝘄𝗻𝗲𝗿 💞🎀\n╔═══❖•ೋ° °ೋ•❖═══╗\n ✨❤️‍🔥 𝐒𝐇𝐀𝐀𝐍 𝐊𝐇𝐀𝐍 ❤️‍🔥✨\n╚═══❖•ೋ° °ೋ•❖═══╝`;

      return api.sendMessage({
        body: msgBody,
        attachment: fs.createReadStream(cachePath)
      }, threadID, (err) => {
        if (err) global.logger.error(err);
        // Cleanup cache file after sending
        if (fs.existsSync(cachePath)) {
          setTimeout(() => fs.unlinkSync(cachePath), 10000);
        }
      }, messageID);

    } catch (error) {
      global.logger.error(`Error in inf command: ${error.message}`);
      return api.sendMessage(`❌ An error occurred: ${error.message}`, threadID, messageID);
    }
  }
};