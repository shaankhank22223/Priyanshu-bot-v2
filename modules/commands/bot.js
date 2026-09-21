const axios = require("axios");

module.exports = {
  config: {
    name: "goibot",
    aliases: [],
    version: "1.0.0",
    description: "Auto-reply keyword bot with personality",
    usage: "Just type and talk to the bot",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "GENERAL"
  },

  handleEvent: async function({ api, message }) {
    const { threadID, messageID, senderID, body } = message;
    if (!body) return;

    try {
      const input = body.toLowerCase();
      
      // Get user name for personalized replies
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo[senderID]?.name || "User";

      // Bot random replies for general mention
      const botReplies = [
        "Haye Main Sadke jawa Teri Masoom Shakal pe baby 💋",
        "Bot Nah Bol Oye Janu bol Mujhe",
        "Kyun Bulaya hamen..😾🔪"
      ];
      const randomBotReply = botReplies[Math.floor(Math.random() * botReplies.length)];

      // Logic triggers
      if (input.includes("chutiya bot") || input.includes("chutiye bot") || input.includes("chumtiya bot")) {
        return api.sendMessage("Hmm... Tu Chutiya PhLe Ungli Kyun Ki Chomu 😾", threadID, messageID);
      }

      if (input === "🤮") {
        return api.sendMessage("Konsa mahina chal raha hai 😝", threadID, messageID);
      }

      if (input === "🤗") {
        return api.sendMessage("Hug me baby ☺️", threadID, messageID);
      }

      if (input === "sim" || input === "simsimi") {
        return api.sendMessage("Prefix Kon Lagayega? Pehle Prefix Lagao Fir Likho Sim", threadID, messageID);
      }

      if (["hi", "hello", "hlw", "helo"].includes(input)) {
        return api.sendMessage("Hello, Hi, Bye bye. Ye sab ke alawa kuch bolna nhi ata Kya tujhe", threadID, messageID);
      }

      if (input === "👌") {
        return api.sendMessage("Tusi Awesome ho 👌👌👌", threadID, messageID);
      }

      if (input === "lol" || input === "lol bot") {
        return api.sendMessage("Khud ko Kya LeGend Samjhte Ho 😂", threadID, messageID);
      }

      if (input === "morning" || input === "good morning") {
        return api.sendMessage("Ꮆɵɵɗ Ɱ❍ɽƞɪɪƞɠ Ɛⱱɛɽɣ❍ƞɛ🌅, Ƭɽɣ ꌗɵɱɛ Cɵffɛɛ ❍ɽ Ƭɛɑ Ƭ❍ Ꮗɑҡɛ Uƥ☕✨💫", threadID, messageID);
      }

      if (input === "anyone" || input === "any") {
        return api.sendMessage("Main Hun Naw Jaaneman ❤️", threadID, messageID);
      }

      if (["shaan", "shaan khan", "shan"].includes(input)) {
        return api.sendMessage("Busy HoGa Work Me Main t0o Hun Naw 😘", threadID, messageID);
      }

      if (input === "owner") {
        return api.sendMessage("💝🥀𝐎𝐖𝐍𝐄𝐑:- ☞𝖘𝖍𝖆𝖆𝖓 𝖐𝖍𝖆𝖓☜ 💫\n🖤𝚈𝚘𝚞 𝙲𝚊𝚗 𝙲𝚊𝚕𝚕 𝙷𝚒𝚖 𝕊ℍ𝔸𝔸ℕ🖤\n😳𝐇𝐢𝐬 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐢𝐝🤓:- https://www.facebook.com/profile.php?id=100016828397863\n👋For Any Kind Of Help Contact On Telegram Username 👉 @Shaankhank335😇", threadID, messageID);
      }

      if (input.includes("tumhe banaya kon hai") || input.includes("tumko banaya kisne")) {
        return api.sendMessage("Shaan ❤️ My Creator. He loves me & Edit Me Daily. Ye Bot Sirf Owner k Liye h. Mujhe Aap logo ko Hasane k liye banya gya h Toh Muh Ladkaye Mat Rakkha Karo. Har Waqt Haste Raho.", threadID, messageID);
      }

      if (input.includes("bot admin") || input.includes("bot ka admin kon ha")) {
        return api.sendMessage("He is Priyansh. He Gives his name Priyansh everywhere", threadID, messageID);
      }

      if (input.includes("shadi karoge") || input.includes("mujhse shadi karoge")) {
        return api.sendMessage("hanji, karunga lekin baccha. apke pet m hoga. manjur h?", threadID, messageID);
      }

      if (["chup", "stop", "chup ho ja", "chup kar"].includes(input)) {
        return api.sendMessage("Nhi Katungu chup. 😼 Mujhe Bolna Hai. Tumhe Koi Haq nhi Mujhe Chup Karane ka. Mera Zuban. Me bolongi", threadID, messageID);
      }

      if (input === "bts" || input === "btc") {
        return api.sendMessage("Tu H Btc. Bhos DK", threadID, messageID);
      }

      if (input.includes("gand") || input.includes("gandu") || input.includes("lund") || input.includes("land")) {
        return api.sendMessage("Gand m jyada khujli h toh banana 🍌 under le le. :))))", threadID, messageID);
      }

      if (input === "chumma de" || input === "kiss me") {
        return api.sendMessage("Kis khushi me, Me sirf Apni Shaan Babu ko kiss karti hu", threadID, messageID);
      }

      if (["nice", "thank you", "thank you bot"].includes(input)) {
        return api.sendMessage("M hu hi itni Accha. sab log Tarref karte hai meri.", threadID, messageID);
      }

      if (["😡", "😤", "😠", "🤬", "😾"].includes(input)) {
        return api.sendMessage("🥺 M toh Sirf Mazak Kr Rha Tha🥺. Gussa Mat Karo. Ek Chummi Lo aur Shant Raho 😘", threadID, messageID);
      }

      if (["😞", "😔", "😣", "☹️", "😟", "😩", "😖", "😫", "😥"].includes(input)) {
        return api.sendMessage("Kya huva, Sad kyu ho, Mujhe batao", threadID, messageID);
      }

      if (input === "hm" || input === "hmm") {
        return api.sendMessage("Hmm Hmm Na Karke Sidha Sidha bolo. Hey Marry Me🙈", threadID, messageID);
      }

      if (["😢", "😭", "🥺", "🥹"].includes(input)) {
        return api.sendMessage("Kya huva, Ro kyu rahe ho, Me huna to phir kyu rona. Ruko me abhi chocolate 🍫 deta hu likho ☞Chocolate☜", threadID, messageID);
      }

      if (["😷", "🤕", "🤧", "🤒"].includes(input)) {
        return api.sendMessage("Kya huva, Tabiyat kharab hai kya, Mujhe batao me abhi medicine 💊💉 le aata hu😇", threadID, messageID);
      }

      if (input === "allah") {
        return api.sendMessage("𝘼𝙇𝙇𝘼𝙃 𝙃𝙐 𝘼𝙆𝘽𝘼𝙍 😇", threadID, messageID);
      }

      if (input === "🤔" || input === "🤨") {
        return api.sendMessage("Kya soch rahe ho etna 🤨", threadID, messageID);
      }

      if (input === "😂" || input === "🤣" || input === "😁") {
        return api.sendMessage("Enni hasi kyu aa rahi hai🤣, Es hasi ke piche ka raaz kya hai batao", threadID, messageID);
      }

      if (["🥰", "😍", "❤️", "😻"].includes(input)) {
        return api.sendMessage("🦋🌿Aƞƙɧ❍ Ɱɛ Ƥɣɑɽ͢ Ɗɪɭɱɛ Ƙɧuɱɑɽ🌬️🌍 ••Ƥɣɑɽ Ƭ❍ɧ Ƞɧɪ Ƙɒɽ ɭɪɣɑ Ɱuȷɧʂɛ>³••🕊️🍎😍", threadID, messageID);
      }

      if (input.includes("kaise ho") || input.includes("how are you")) {
        return api.sendMessage("Me Tabhi Accha hota hu, Jab Apko Hasta Huye Dekhta hu☺️", threadID, messageID);
      }

      // Special Trigger for when the word "Bot" is mentioned anywhere
      if (input.startsWith("bot")) {
        const msg = {
          body: `🕊️🥀 ${name} 🥀🕊️\n\n❖•S━━━━━💞━━━━━A•❖\n\n${randomBotReply}\n\n𝗖𝗿𝗲𝗱𝗶𝘁𝘀: 𒁍≛⃝𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 𝑲 ❥||ㅎ\n\n❖•S━━━━━💞━━━━━A•❖`
        };
        return api.sendMessage(msg, threadID, messageID);
      }

    } catch (error) {
      global.logger.error(`Error in goibot: ${error.message}`);
    }
  },

  run: async function({ api, message, args }) {
    // This command mostly works through handleEvent
    return api.sendMessage("I am active! Just talk to me normally without any prefix.", message.threadID, message.messageID);
  }
};