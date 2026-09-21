const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Message Data Array
const nam = [
  {
    timer: '12:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 12:00 AM\n\n   رات کی خاموشی میں بھی ایک الگ شادابی ہے،\n   سو جاؤ کہ کل کا سورج ایک نیا موڑ لائے گا۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '01:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 01:00 AM\n\n   خاموشیوں کے شَہر میں اُمید کا چراغ جلا،\n   اندھیری رات ہی میں تو راستہ صاف نظر آتا ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '02:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 02:00 AM\n\n   جب ہر طرف تنہائی ہو تو خدا یاد آتا ہے،\n   وہی تو ہے جو سچے دل کی ہر بات سنتا ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '03:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 03:00 AM\n\n   محنت اور صبر کا دامن کبھی मत چھوڑنا،\n   کیونکہ سچی لگن ہی انسان کو منزل تک پہنچاتی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '04:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 04:00 AM\n\n   صبح کا نور اب جلد پھیلنے والا ہے،\n   ہر نئی صبح ایک نیا موقع ساتھ لاتی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '05:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 05:00 AM\n\n   اذان کا وقت اور نیکیوں کی طلب،\n   خدا کی بارگاہ میں ہر دعا قبول ہوتی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '06:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 06:00 AM\n\n   صبح بخیر! ایک نئی مسکراہٹ کے ساتھ دن کا آغاز کریں،\n   خود پر یقین ہی کامیابی کی پہلی سیڑھی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '07:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 07:00 AM\n\n   روشنی پھیلی ہے چاروں طرف امید بن کر،\n   ہر لمحہ جی لو خوشی کی دھن بن کر۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '08:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 08:00 AM\n\n   زندگی میں آگے بڑھنے کا سفر شروع کیجیے،\n   جو لوگ محنت کرتے ہیں، کامیابی ان کے قدم چومتی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '09:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 09:00 AM\n\n   اپنے کام پر توجہ دو اور محنت جاری رکھو،\n   وقت بدلے گا اور تمہارا دور آئے گا۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '10:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 10:00 AM\n\n   ہمیشہ دوسروں کے کام آنے کی کوشش کرو،\n   خلوصِ دل سے کی گئی نیکی کبھی ضائع نہیں ہوتی۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '11:00:00 AM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 11:00 AM\n\n   زندگی کے ہر لمحے کو خوبصورتی سے جیو،\n   یہ وقت دوبارہ لوٹ کر کبھی نہیں آئے گا۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '12:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 12:00 PM\n\n   دوپہر کا وقت ہے تھوڑا آرام بھی ضروری ہے،\n   صحت اور سکون ہی زندگی کی سچی دولت ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '01:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 01:00 PM\n\n   حق اور سچائی کا راستہ ہمیشہ مشکل ہوتا ہے،\n   لیکن اسی راستے پر عزت اور کامیابی ملتی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '02:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 02:00 PM\n\n   مشکلات سے گھبرانا کیسا،\n   ہر مشکل کے بعد آسانیاں مسکراتی ہیں۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '03:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 03:00 PM\n\n   خواب وہ نہیں جو ہم سوتے ہوئے دیکھتے ہیں،\n   خواب وہ ہیں جو ہمیں سونے نہیں دیتے!🕊️\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '04:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 04:00 PM\n\n   شام کا وقت اور ایک پیالی چائے،\n   زندگی کی سادہ سی چیزوں میں بھی سکون ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '05:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 05:00 PM\n\n   سورج کے ڈھلنے میں بھی اک ادا ہے،\n   دن بھر کی تھکن اب ختم ہونے کو ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '06:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 06:00 PM\n\n   شام کا منظر کتنا دلکش ہوتا ہے،\n   اپنوں کے ساتھ مل بیٹھو اور خوشیاں بانٹو۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '07:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 07:00 PM\n\n   رات کی آمد اور پرسکون ماحول،\n   خدا کا شکر ادا کرو ہر نعمت کے لیے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '08:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 08:00 PM\n\n   آج کا کام آج ہی ختم کیجیے،\n   کل کے دن کو ایک نئی شروعات دیجیے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '09:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 09:00 PM\n\n   اپنے دل کو صاف رکھو اور سب کو معاف کر دو،\n   خدا بھی انہی کو پسند کرتا ہے جو دل کے صاف ہوں۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '10:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 10:00 PM\n\n   رات گہری ہو چکی ہے اور تاروں کی چمک،\n   ایک نئے کل کا حسین پیغام دے رہی ہے۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  },
  {
    timer: '11:00:00 PM',
    message: ['╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n   ⏰ 𝐓𝐢𝐦𝐞: 11:00 PM\n\n   دن بھر کی تھکن کو اب بھول جاؤ،\n   میٹھے خوابوں کے ساتھ سکون کی نیند سو جاؤ۔\n\n╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: 𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 👑• ━━━╯']
  }
];

let lastSentTime = "";

module.exports = {
  config: {
    name: "autosent",
    aliases: [],
    version: "1.0.0",
    description: "Automatically sends scheduled messages to all groups based on Karachi time",
    usage: "{prefix}autosent",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "PUBLIC",
    cooldown: 5,
    category: "SYSTEM"
  },

  init: function({ api }) {
    if (!global.autoSentInterval) {
      global.logger.system("AutoSent Karachi Notification system initialized.");
      
      global.autoSentInterval = setInterval(async () => {
        try {
          // Get current time in Karachi timezone with 2-digit hour padding
          const now = new Date();
          const timeString = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Karachi",
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }).toUpperCase(); // Ensure AM/PM matches uppercase in 'nam' array

          // Prevent sending multiple times in the same second
          if (lastSentTime === timeString) return;

          // Find if current Karachi time matches any entry in 'nam' array
          const matched = nam.find(i => i.timer === timeString);
          
          if (matched) {
            lastSentTime = timeString;
            
            // Fetch all thread IDs from database
            let allThreads = [];
            try {
              if (global.Thread && typeof global.Thread.getAll === "function") {
                const threads = await global.Thread.getAll();
                allThreads = threads.map(t => t.threadID);
              } else if (global.data && global.data.allThreadID) {
                allThreads = global.data.allThreadID;
              }
            } catch (dbError) {
              global.logger.error("AutoSent database fetch failed: " + dbError.message);
            }

            if (allThreads.length === 0) return;

            // Select message
            const msg = matched.message[Math.floor(Math.random() * matched.message.length)];

            // Broadcast to all groups
            for (const threadID of allThreads) {
              api.sendMessage(msg, threadID, (err) => {
                if (err) {
                  // Silently skip if bot was kicked or thread is inaccessible
                }
              });
              // 500ms delay to prevent Facebook spam detection
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          global.logger.error("Error in AutoSent Interval: " + error.message);
        }
      }, 1000); // Check every second
    }
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    try {
      const now = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Karachi",
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      return api.sendMessage(
        `⏰ 𝐀𝐮𝐭𝐨𝐒𝐞𝐧𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐒𝐭𝐚𝐭𝐮𝐬:\n\n` +
        `● 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐓𝐢𝐦𝐞 (𝐊𝐚𝐫𝐚𝐜𝐡𝐢): ${now}\n` +
        `● 𝐒𝐭𝐚𝐭𝐮𝐬: Active ✅\n\n` +
        `This command automatically broadcasts scheduled notifications to all groups.`, 
        threadID, 
        messageID
      );
    } catch (e) {
      return api.sendMessage("❌ Error checking system status.", threadID, messageID);
    }
  }
};