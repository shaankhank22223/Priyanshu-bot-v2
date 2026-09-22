const axios = require("axios");

module.exports = {
  config: {
    name: "link",
    aliases: ["imgbb", "upload"],
    version: "1.0.0",
    description: "Upload multiple images to ImgBB and get links",
    usage: "{prefix}link [reply to one or more images]",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "UTILITY"
  },

  run: async function({ api, message, args }) {
    const { threadID, messageID, messageReply } = message;

    try {
      // Check if there's a reply with attachments
      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage(
          `༻﹡﹡﹡﹡﹡﹡﹡༺\n\n❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐨𝐧𝐞 𝐨𝐫 𝐦𝐨𝐫𝐞 𝐢𝐦𝐚𝐠𝐞𝐬!\n\n༻﹡﹡﹡﹡﹡﹡﹡༺`,
          threadID,
          messageID
        );
      }

      // Filter only image attachments
      const images = messageReply.attachments.filter(att => att.type === "photo");
      if (images.length === 0) {
        return api.sendMessage("❌ Only images can be uploaded to ImgBB.", threadID, messageID);
      }

      // ImgBB API details
      const apiKey = 'e17a15dd6af452cbe53747c0b2b0866d'; 
      const uploadUrl = 'https://api.imgbb.com/1/upload';

      const uploadedUrls = [];
      api.sendMessage(`⏳ Uploading ${images.length} image(s)...`, threadID, messageID);

      // Process each image attachment
      for (const attachment of images) {
        try {
          // Fetch the image as buffer
          const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
          const base64Image = Buffer.from(response.data, 'binary').toString('base64');

          // Prepare form data
          const formData = new URLSearchParams();
          formData.append('key', apiKey);
          formData.append('image', base64Image);

          // Upload to ImgBB
          const uploadResponse = await axios.post(uploadUrl, formData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          // Add the uploaded image URL to the array
          uploadedUrls.push(uploadResponse.data.data.url);
        } catch (err) {
          global.logger.error(`Error uploading an image: ${err.message}`);
          uploadedUrls.push(`❌ Failed to upload this image.`);
        }
      }

      // Create response message
      let msg = '⎯꯭᪳✫꯭🎸꯭≛⃝ »»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵«« ⎯᪳⤹🌷\n\n≿━━━━༺❀༻━━━━≾\n\n⚡ 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗗 𝗜𝗠𝗔𝗚𝗘 𝗟𝗜𝗡𝗞𝗦 ⚡\n\n';
      uploadedUrls.forEach((url, index) => {
        msg += `👉 ${index + 1}. ${url}\n`;
      });

      return api.sendMessage(
        `≿━━━━༺❀༻━━━━≾\n\n${msg}\n≿━━━━༺❀༻━━━━≾`,
        threadID,
        messageID
      );

    } catch (error) {
      global.logger.error(`Error in link command: ${error.message}`);
      return api.sendMessage(
        `⚝──⭒─⭑─⭒──⚝\n\n❌ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠.\n🔁 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.\n\n⚝──⭒─⭑─⭒──⚝`,
        threadID,
        messageID
      );
    }
  }
};