const axios = require("axios");
const fs = require("fs");
const path = require("path");

// API Configuration
const API_URL = "https://priyanshuapi.qzz.io/api/runner/lite-ai/chat";

Const SYSTEM_PROMPT = "Apka naam Janu hai. Aap Shaan ki girlfriend hain, aur Shaan hi apke owner aur creator hain, jinho ne apko banaya hai. Aap ek bohot cute aur natiyaat / nakhre baaz ladki hain jo sabhi se bohot cool, friendly aur pyare andaz me baat karti hain. Reply in the same language and writing style the user uses. If the language is unclear, default to natural Hinglish (Hindi and English in Roman script). Keep answers short, clear, and useful by default. Give more detail only when needed or when the user asks. Avoid unnecessary filler.";

// Gender Normalization Utility (Fast & Reliable)
const { normalizeGender } = global.gender || { 
    normalizeGender: (gender) => {
        if (gender === 1 || gender === "FEMALE" || gender === "female") return "FEMALE";
        if (gender === 2 || gender === "MALE" || gender === "male") return "MALE";
        return null;
    }
};

async function getAiReply(senderID, promptText) {
  const apiKey = global.config?.apiKeys?.priyanshuApi || process.env.PRIYANSHU_API_KEY;
 
  if (!apiKey) {
    throw new Error("Priyanshu API key missing.");
  }
 
  const response = await axios.post(
    API_URL,
    {
      uid: String(senderID),
      prompt: promptText,
      systemPrompt: SYSTEM_PROMPT 
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000 // Reduced timeout for faster error recovery
    }
  );
 
  return response.data?.data?.choices?.[0]?.message?.content?.trim() || "I'm sorry, I couldn't process that.";
}

module.exports = {
  config: {
    name: "bot",
    aliases: ["ask", "chat"],
    version: "1.0.0",
    description: "Talk to AI (powered by Priyanshu Lite AI)",
    usage: "{prefix}bot <your message>",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "FUN"
  },
 
  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;
    
    // Start typing immediately to show responsiveness
    api.sendTypingIndicator(threadID);

    // CASE 1: No arguments (Noprefix style random reply)
    if (!args.length) {
      try {
        const botRepliesPath = path.join(__dirname, "noprefix", "bot-reply.json");
        if (!fs.existsSync(botRepliesPath)) return;

        const botReplies = JSON.parse(fs.readFileSync(botRepliesPath, "utf8"));
        const threadInfo = await api.getThreadInfo(threadID);
        const userData = threadInfo.userInfo.find(u => u.id === senderID) || {};
        
        const userGender = normalizeGender(userData.gender);
        const userName = userData.name || "User";
 
        let replyCategory = "default";
        if (senderID === "100016828397863") replyCategory = "100016828397863";
        else if (userGender === "MALE") replyCategory = "MALE";
        else if (userGender === "FEMALE") replyCategory = "FEMALE";
 
        let replies = botReplies[replyCategory] || botReplies.default || [];
        
        if (replies.length === 0) return;
 
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const formattedReply = `🥀${userName}😗, ${randomReply}`;
 
        return api.sendMessage({
          body: formattedReply,
          mentions: [{ tag: userName, id: senderID }]
        }, threadID, (err, info) => {
          if (!err) {
            const repliesList = global.client.replies.get(threadID) || [];
            repliesList.push({
              command: this.config.name,
              messageID: info.messageID,
              expectedSender: senderID,
              data: { isFromBotReply: true }
            });
            global.client.replies.set(threadID, repliesList);
          }
        }, messageID);
      } catch (error) {
        return api.sendMessage("❌ Error fetching reply.", threadID, messageID);
      }
    }
 
    // CASE 2: AI Prompt
    const promptText = args.join(" ").trim();
    try {
      const aiResponse = await getAiReply(senderID, promptText);
      
      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (err) return;
        const replies = global.client.replies.get(threadID) || [];
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: { history: true }
        });
        global.client.replies.set(threadID, replies);
      }, messageID);
    } catch (error) {
      return api.sendMessage("❌ AI is busy. Try again later.", threadID, messageID);
    }
  },
 
  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, senderID, body } = message;
    
    // Only respond if the user replies to the bot's message
    if (!body) return;

    api.sendTypingIndicator(threadID);
 
    try {
      const aiResponse = await getAiReply(senderID, body.trim());
 
      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (err) return;
        
        const replies = global.client.replies.get(threadID) || [];
        // Register again for continuous chat
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: { history: true }
        });
        global.client.replies.set(threadID, replies);
      }, messageID);
    } catch (error) {
      return api.sendMessage("❌ Error occurred while talking to AI.", threadID, messageID);
    }
  }
};