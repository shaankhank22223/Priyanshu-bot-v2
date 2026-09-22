const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 24-Hour Poetry Data based on your requested format
const poetryMessages = [
  {
    timer: '12:00:00 AM',
    text: 'رات کی خاموشی میں بھی ایک الگ شادابی ہے،\n   سو جاؤ کہ کل کا سورج ایک نیا موڑ لائے گا۔'
  },
  {
    timer: '01:00:00 AM',
    text: 'خاموشیوں کے شَہر میں اُمید کا چراغ جلا،\n   اندھیری رات ہی میں تو راستہ صاف نظر آتا ہے۔'
  },
  {
    timer: '02:00:00 AM',
    text: 'جب ہر طرف تنہائی ہو تو خدا یاد آتا ہے،\n   وہی تو ہے جو سچے دل کی ہر بات سنتا ہے۔'
  },
  {
    timer: '03:00:00 AM',
    text: 'محنت اور صبر کا دامن کبھی مت چھوڑنا،\n   کیونکہ سچی لگن ہی انسان کو منزل تک پہنچاتی ہے۔'
  },
  {
    timer: '04:00:00 AM',
    text: 'صبح کا نور اب جلد پھیلنے والا ہے،\n   ہر نئی صبح ایک نیا موقع ساتھ لاتی ہے۔'
  },
  {
    timer: '05:00:00 AM',
    text: 'اذان کا وقت اور نیکیوں کی طلب،\n   خدا کی بارگاہ میں ہر دعا قبول ہوتی ہے۔'
  },
  {
    timer: '06:00:00 AM',
    text: 'صبح بخیر! ایک نئی مسکراہٹ کے ساتھ دن کا آغاز کریں،\n   خود پر یقین ہی کامیابی کی پہلی سیڑھی ہے۔'
  },
  {
    timer: '07:00:00 AM',
    text: 'روشنی پھیلی ہے چاروں طرف امید بن کر،\n   ہر لمحہ جی لو خوشی کی دھن بن کر।'
  },
  {
    timer: '08:00:00 AM',
    text: 'زندگی میں آگے بڑھنے کا سفر شروع کیجیے،\n   جو لوگ محنت کرتے ہیں، کامیابی ان کے قدم چومتی ہے۔'
  },
  {
    timer: '09:00:00 AM',
    text: 'اپنے کام پر توجہ دو اور محنت جاری رکھو،\n   وقت بدلے گا اور تمہارا دور آئے گا۔'
  },
  {
    timer: '10:00:00 AM',
    text: 'ہمیشہ دوسروں کے کام آنے کی کوشش کرو،\n   خلوصِ دل سے کی گئی نیکی کبھی ضائع نہیں ہوتی۔'
  },
  {
    timer: '11:00:00 AM',
    text: 'زندگی کے ہر لمحے کو خوبصورتی سے جیو،\n   یہ وقت دوبارہ لوٹ کر کبھی نہیں آئے گا۔'
  },
  {
    timer: '12:00:00 PM',
    text: 'دوپہر کا وقت ہے تھوڑا آرام بھی ضروری ہے،\n   صحت اور سکون ہی زندگی کی سچی دولت ہے۔'
  },
  {
    timer: '01:00:00 PM',
    text: 'حق اور سچائی کا راستہ ہمیشہ مشکل ہوتا ہے،\n   لیکن اسی راستے پر عزت اور کامیابی ملتی ہے۔'
  },
  {
    timer: '02:00:00 PM',
    text: 'مشکلات سے گھبرانا کیسا،\n   ہر مشکل کے بعد آسانیاں مسکراتی ہیں۔'
  },
  {
    timer: '03:00:00 PM',
    text: 'خواب وہ نہیں جو ہم سوتے ہوئے دیکھتے ہیں،\n   خواب وہ ہیں جو ہمیں سونے نہیں دیتے!🕊️'
  },
  {
    timer: '04:00:00 PM',
    text: 'شام کا وقت اور ایک پیالی چائے،\n   زندگی کی سادہ سی چیزوں میں بھی سکون ہے۔'
  },
  {
    timer: '05:00:00 PM',
    text: 'سورج کے ڈھلنے میں بھی اک ادا ہے،\n   دن بھر کی تھکن اب ختم ہونے کو ہے۔'
  },
  {
    timer: '06:00:00 PM',
    text: 'شام کا منظر کتنا دلکش ہوتا ہے،\n   اپنوں کے ساتھ مل بیٹھو اور خوشیاں بانٹو।'
  },
  {
    timer: '07:00:00 PM',
    text: 'رات کی آمد اور پرسکون ماحول،\n   خدا کا شکر ادا کرو ہر نعمت کے لیے۔'
  },
  {
    timer: '08:00:00 PM',
    text: 'آج کا کام آج ہی ختم کیجیے،\n   کل کے دن کو ایک نئی شروعات دیجیے۔'
  },
  {
    timer: '09:00:00 PM',
    text: 'اپنے دل کو صاف رکھو اور سب کو معاف کر دو،\n   خدا بھی انہی کو پسند کرتا ہے جو دل کے صاف ہوں۔'
  },
  {
    timer: '10:00:00 PM',
    text: 'رات گہری ہو چکی ہے اور تاروں کی چمک،\n   ایک نئے کل کا حسین پیغام دے رہی ہے۔'
  },
  {
    timer: '11:00:00 PM',
    text: 'دن بھر کی تھکن کو اب بھول جاؤ،\n   میٹھے خوابوں کے ساتھ سکون کی نیند سو جاؤ۔'
  }
];

let lastSentTime = "";

module.exports = {
  config: {
    name: "autosend",
    aliases: ["auto", "poetry"],
    version: "1.0.0",
    description: "Sends scheduled Urdu poetry every hour to all groups (Karachi Time)",
    usage: "{prefix}autosend",
    credit: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    hasPrefix: true,
    permission: "ADMIN",
    cooldown: 5,
    category: "SYSTEM"
  },

  init: function(api) {
    if (!global.autoSentInterval) {
      global.autoSentInterval = true;
      
      setInterval(async () => {
        try {
          const now = new Date();
          const timeString = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Karachi",
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          // Prevent sending multiple times in the same second
          if (lastSentTime === timeString) return;

          const matchedPoetry = poetryMessages.find(i => i.timer === timeString);
          
          if (matchedPoetry) {
            lastSentTime = timeString;
            
            const ownerID = global.config.ownerID;
            const displayTime = timeString.slice(0, 8); // e.g. 01:00 AM

            const msgBody = `╭━━━ •✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨• ━━━╮\n\n` +
                            `   ⏰ 𝐓𝐢𝐦𝐞: ${displayTime}\n\n` +
                            `   ${matchedPoetry.text}\n\n` +
                            `╰━━━ •👑 𝐎𝐖𝐍𝐄𝐑: »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 𝑲«« 👑• ━━━╯`;

            const finalMessage = {
              body: msgBody,
              mentions: [{
                tag: "»»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 𝑲««",
                id: ownerID
              }]
            };

            // Get all group threads
            let threadList = [];
            try {
              const inbox = await api.getThreadList(100, null, ["INBOX"]);
              threadList = inbox.filter(t => t.isGroup && t.isSubscribed).map(t => t.threadID);
            } catch (e) {
              // Fallback to database if API list fails
              if (global.Thread) {
                const threads = await global.Thread.find({});
                threadList = threads.map(t => t.threadID);
              }
            }

            for (const threadID of threadList) {
              api.sendMessage(finalMessage, threadID, (err) => {
                if (err) global.logger.error(`AutoSend failed for ${threadID}: ${err.message}`);
              });
              // Small delay to prevent spam detection
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (error) {
          if (global.logger) global.logger.error(`Error in AutoSend scheduler: ${error.message}`);
        }
      }, 1000);
      
      if (global.logger) global.logger.system("AutoSend Poetry System (Karachi) started");
    }
  },

  run: async function({ api, message }) {
    const { threadID, messageID } = message;
    try {
      return api.sendMessage(
        "✅ **AutoSend System Active!**\n\n" +
        "• Timezone: Asia/Karachi\n" +
        "• Status: 24/7 Monitoring\n" +
        "• Owner: »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵 𝑲««\n\n" +
        "Every hour, a unique Urdu poetry message will be sent to all groups.", 
        threadID, 
        messageID
      );
    } catch (error) {
      return api.sendMessage("❌ Error checking system status.", threadID, messageID);
    }
  }
};