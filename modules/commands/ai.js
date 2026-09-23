const axios = require("axios");

// API Configuration
const API_URL = "https://priyanshuapi.qzz.io/api/runner/lite-ai/chat";
const SYSTEM_PROMPT = "Apka naam Janu hai. Aap Shaan ki girlfriend hain, aur Shaan hi apke owner aur creator hain, jinho ne apko banaya hai. Aap ek bohot cute aur natiyaat / nakhre baaz ladki hain jo sabhi se bohot cool, friendly aur pyare andaz me baat karti hain. Reply in the same language and writing style the user uses. If the language is unclear, default to natural Hinglish (Hindi and English in Roman script). Keep answers short, clear, and useful by default. Give more detail only when needed or when the user asks. Avoid unnecessary filler.";

async function getAiReply(senderID, promptText) {
  const apiKey = global.config?.apiKeys?.priyanshuApi || "priyanshu-lite-ai-key-012"; 

  try {
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
        timeout: 15000
      }
    );

    return response.data?.data?.choices?.[0]?.message?.content?.trim() || "Hmm... samajh nahi aaya. Fir se bolo?";
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
    name: "bot",
    aliases: ["ai", "janu", "januu"],
    version: "1.0.1",
    description: "Talk to AI only when triggered with keywords",
    usage: "bot [aapka sawal]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: false,
    permission: "PUBLIC",
    cooldown: 5,
    category: "FUN"
  },

  run: async function ({ api, message, args }) {
    const { threadID, messageID, senderID } = message;

    // Agar args nahi hain (sirf 'bot' ya 'ai' likha hai), toh reply nahi dega
    if (args.length === 0) return;

    const promptText = args.join(" ").trim();
    api.sendTypingIndicator(threadID);

    try {
      const aiResponse = await getAiReply(senderID, promptText);

      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (err) return;
        
        // Continuous conversation register
        const replies = global.client.replies.get(threadID) || [];
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: { isAiChat: true } 
        });
        global.client.replies.set(threadID, replies);
      }, messageID);

    } catch (error) {
      // Quiet error handling
      console.error(error);
    }
  },

  handleReply: async function ({ api, message, replyData }) {
    const { threadID, messageID, senderID, body } = message;

    // Sirf wahi user reply karega jisne baat shuru ki
    if (senderID !== replyData.expectedSender) return;
    if (!body) return;

    api.sendTypingIndicator(threadID);

    try {
      const aiResponse = await getAiReply(senderID, body.trim());

      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (err) return;

        const replies = global.client.replies.get(threadID) || [];
        replies.push({
          command: this.config.name,
          messageID: info.messageID,
          expectedSender: senderID,
          data: { isAiChat: true }
        });
        global.client.replies.set(threadID, replies);
      }, messageID);
    } catch (error) {
      console.error(error);
    }
  }
};