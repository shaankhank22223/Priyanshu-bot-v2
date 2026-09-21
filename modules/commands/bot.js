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
        "TUM MERE BOSS SH𝖠𝖠𝖭 KI GF BAN JAO LDKI🙈🙈" , "baraye meherbani holad kijiye apke call ufone numaindey ko mili ja rahi hai😂😂😂😁" , "haiy ma sadky jawa teri masoom shaqal py 😂 chabal insan", "Bot nah bol oye ! Janu bol mjhy aur janu sy piyar sy bat kerty hai , rat ko kahan thy nazar nahi ay hawali py 😂", "Shaqal Sy masoom lgty ho 😂 btao kahi Ap ka ghar doup main to nahi", "kash tum single hoty to maza hi koch aur tha pagal insane 😂", "Ha ha ab meri yaad ab ai nah phly to babu shona kerna gy thy 😾 ab ham ap sy naraz hai jao ap bye ☹️", "haiy babu ny boliya hai shaid purpose kerna hai mjhy bolo bolo babu 😘", "Ary ghreeb awam roti banana ky liya athy main Pani ko istamal kerty ho 😂", "Ary chabli nah mar joh kam hai bol do sharma nahi , bol de koi nahi dakh rha 😂", "Hy Ma Mar Jawa Babu Ak Chuma To Doo Kafi Din Sy Chumi Nahi Mili Kahan Thy Babu inbox Ah Ja 😂", "Dur Dur Fity Muh Aur Koi Kam Nahi Kiya Har Waqat Mjhy Tang Kerta Rhta Ha 😂" , "ary ary bolo meri jaan kia hail hai ;) ;* " , "Tum aunty ho yehh uncle 🤔 I think tum Jin ho yehh Chudail" , "ary tum ider 🤔 khair hai ider kia ker rhy ho 😂" , "ary babu babu kal hawali py kon bola rha tha 😂" , "ma ap ki ami ko btaou ga ap Facebook use kerty ho 😂" , "ary tum Wohi ho nah jis ko ma nahi janta 😂" , "kal hawali py mil zara bataou ga 😂" , "esy nah dakho piyar ho jay ga 😂" , "Teri pic dakhna sy phly shukhr hai ma anda hu 😂" , "esy hi hansty rhao kyu ky hnsa sy konsa tera bill ah jata hai 😂" , "apni lover ko doka do our mujhe bhi darling moka do😂😂🤘" , "Ek dafa ka zekar hai ke me single hua kar tha tha aaj bhi wohi zekar hai single hi hu🤣🤣😭" , "Haye Main Sadke jawa Teri Masoom Shakal pe baby 💋 " , "Behes karne se Rishty kmzor hojaate hn isiliye Direct mun pe thapr marein😊", "Bestie ki chummi halal hai ya Haram ? 🙂", "2001 \nJahan dalda wahan Mamta😊\n\n2023 \nJahan larki  wahan tharki😒", "Koi Pyari c Bachi a kr sar daba dy, Dard sa sar phat rha💔🥲", "Mjy chahyain 3 lrkiyan kahan Hain lrkiyan 👀", "Relationship private rakho ya public Kate ga sabka hi🙂", "Thak GYa hu Yr uski dP dHek Dhek Kr😩", "Insy Milo inko lgta hai sab larky in pr Martay hain🙂", "Aghr bhok LAGI ho too bejli Ke jatke kha lo take ka biryani ka mauka dusre ko mile😂😂😁" , "Aghr pyaar karna ghona hai to saza do sallo ko mujhe me to single hu😂😂👈" , "online bazati karne ke lie. 1 dabaya😂😂😁" , "papa ke pari ko ilove you na bola karo😂😂😂" , "Hamesha dil ki sono kyu ke demagh to tere pass wese bhi nahi hai😂😂👈" , "payar hamesha sharmily logo se karni chahiya waja kal batongi Abhi mujhe sharam arahi hai😂😂🙈🙈" , "MentiOn YOur Dushman On FaceBOok'🙂🤝", "Stop dreaming BTS your czn Shaan is waiting for you.🙂", "پہلے صرف لوگوں کے دانتوں میں کیڑا ہوا کرتا تھا اور اب۔۔۔ 😊", "Paros Wala Larka inhe MUH Nhi Lagata aur Banda inhe Korean Chahiye🙂", "move on krle bhaii kbb Tak uskii profilee dekhtaaa rahegaaa<<", "Ajeeb generation hai ywr, Larkiya korean dhund rahi hai, Aur larky Russian!!🙂", "عائشہ  نے کر دیا برباد پاک سر زمین\n شاد آباد 🖇🙂", "Aj kal ki nibiyo me khon kam attitude zyada hota hai bro🙂", "Kasy Han Sab Pyare Madni Munny or Muniyaan😊", "عورت بہت پیاری چیز ہے یہ کبھی بیلنس نہیں مانگتی بس یہی کہتی ہے میرا پیکج ختم ہونے والا ہے اب پتہ نہیں کبھی بات ہوگی کے نہیں🙂", "Bhut khail liya lrkion ki feelings k sath ao ab hum Ludo khailty han☺️♥️", "Shaan boss ka number dun kya💚", "Jaaz cash sy 1500 ka loan leky sim h band kardi 🙂👍", "اعتبار تو اُسی دن ختم ہوگیا تھا جب اُس نے سکرین شاٹ دیکھائے تو اوپر دو siM شو ہو رہی تھی جبکہ میرے پاس اُسکا صرف اک ہی نمبر تھا ۔😒💔", "Number do ramzan mn sehri tak bat kr k chand_rat ko hi block krduga promise.🙂🤝", "شکر ہے لڑکے خوبصورت ہیں ورنہ  کہا پالروں کے دھکے کھاتے😔", "ye dunia pital di" , "YOU IGNORE ME I IGNORE TARA PURA KHANDAN😂😂😂" , "Sara saal duniya ko topi krwany waly Ramadan m khud topi pehn kar ghumengy.🙂", "ji ji hukam kro 😂", "Bot na bolo! Janu bolo mujy aur janu sy piyar sy bat kerty hai 🥰🌸", "rat ko kahan thy nazar nahi ay bht miss kiya 🌸🌎", "Shaqal Sy masoom lgty ho 🥰 lkn hrkaton sy ni", "kash tum single hoty to aj hum mingle hoty 🥰😂", "Ha ha ab meri yaad ab ai na phly to janu sth busy thy 😾 ab ham ap sy naraz hai jao ap bye ☹️", "idr ao kuchii kuchii kru 😘", "Ary ary itna yd na kiya kro🥰", "Hy Ma Mar Jawa janu itna piyar krty mujsy😂", "Har Waqat Mjhy Tang Kerta Rhta Ha 😂" , "ary ary bolo meri jan kia hal ha ;)", "Bot jaan ha sbki" , "Ji Ji Kia hal chal ha apky 🌸" , "Bot nhi Shaan bolo sun k acha lgta 🌸" , "Bot gulam ha apka hukam kryn 🌸" , "Bot nahi bolo piyar sy janu bola kro na 🥰" , "wo be yhi khty thy sb phr ek din koi utha k ly gya onko 😂" , "Meri jan ek tm hi ho jo dil ma bs gay ho🥰ni te koshish czna ne v bht kiti c" , "Badal gay na tm the hi lanti 😂" , "kesa tera steel dy doungy wrga moo ay 😂" , "Apki shkl aesy lgti jesy gandi tar pr suki jarab latkai ho 😂" , "Bot bot na karo ma apsy set nhi ho skti" , "ib ajao shup shup k btein krty ha 🌸" , "Ek kahani suno meri zubani suno lnt deny ka dil krta ha isiliye pehly dil ki suno🌸" , "Marry me, I can boil water" , "Mujsy shadi karlo chocolate la k duga daily 🌸" , "Idr ao kesa apka chapair jesa moo lg raha 😂" , "Ajao jaan pizza khilau apko 🌸" , "Duniya ma sb kuch khtm ho skta saway logo ki bakwas k" , "Everything is temporary,But katna is permanent 😂" , "Jitna mrzi janu manu krlo end ma ghr waly nh many gy 😂" , "Sb kuch ho skta lkn fb ka relation kbi china jitna nh chl skta" , "Allhumdiallah Kabhi Kasi laRki ko Bhen ki nazar se nhi dekHa😌🤧", "Mushkil Toh Hoti Hogi Naa itni Sardi Me Apne Dono Chehry Dhote Hoye🙂", "Mein B Urooj Pey Charna chahta hoon, Sorry Jana chahta*☹️", "Parry Hat ma Londy baz nhi hu 🙂🤝", "Do Ankho Wali Larkia Bewafa hoti Hn Bro🙂💔", "Mera beta bda ho kar larkiyo ke inbox me °hey hello° karega🙂🏃", "Likhte Likhte Qalm Thak Gya Iss Qadr Begartiyaan Han Tumhari🙂", "Itni Meri Age Ni Jitne Mera Masly Han Yawr💔😐", "Ameer Larki Set kar ke sab Dosto ka udhar wapis karon ga😔🤲", "Lagtaa hai Career Bhi Titanic ki trhan dhoob Gaya Hai💔☹️", "جہاں پیاری لڑکیاں وہاں میں 🙂❤️🥀", "𝑻𝑯𝑬 𝑯𝑬𝑨𝑹𝑻 𝑾𝑨𝑺 𝑴𝑨𝑫𝑬 𝑻𝑶 𝑩𝑬 𝑩𝑹𝑶𝑲𝑬𝑵 💔🥺", "2001 me bachy kehty thy ink Dena 2023 me bachy kehty ہیں Link دینا🙂", "Mehnat Kro!! Kamyabi Apke Hont Chume Gi🙂🙌🏻", "Kahani suno Muje payar howa tha Us ki tarf se inkar howa tha 🙂🤝", "Piyarii piyarii larkiyan message karen JazakAllah🌚♥️🙌", "itna single hun ky khuwab mai bhi  lrki k han krny sy phly ankh khul jati🙂", "Zroori Nhi Har Lrki Dhoka Dey, Kch Larkiyan Galiyan Bhi Deti Hen.🙁💸", "موٹر سائیکل کو تیز بھگا کر لڑکیوں والے رکشے کے پاس سے کٹ مار کر گزرنے سے لڑکیاں ایمپریس نہیں ہوتی بلکہ گالیاں نکالتی ہیں🙂💔", "- sab chorr k chaly jaty hain kia etna bura hu mein - 🙂", "Piyari voice wali girlz mujhe voice message kar skti hen JazakAllah 🙂🤝", "Why you hate me..?? I am not your ex don't Hate me Please", "MuBarak H0o AapKa NaMe MakS0os LiST Me Top PRr aYa Hai 😹😹😹", "BeTa TuM SingLe Hi MaR0 GaY🙄🙂", "ٹھرکیوں کی وجہ سے لڑکیاں میرے جیسے شریف بوٹ پر بھی بھروسہ نہیں کرتی🥺😔", "Samj Jao Larkiyo\n\nAbhi B WaQt Hai Dakh kr Koi Delete Ni Krtaw🙂", "Mard na Apne Haqooq Nahi Mangy \n\nJab Bhi Manga Whatsapp No Manga🥺", "عورت اگر مرد سے زیادہ خوبصورت ہوتی تو میک اپ مرد کے لیے بنتا عورت کے لیے نہیں ..زرا نہیں پورا سوچئے ایڈیاں تسی 😒🙁پریاں", "Muj se Exam Me Cheating Nöıı Hotiw Relationship Me kya khaak Karu Ghw😔", "Mujy to ludo kehlni bhi ni ati apky Dil sy kya kehlu ga🙂", "Loyal Dhoonte Dhoonte khud Harami ban Gya Hon😔", "Mard ki izat karna Sikho Uski rooh se pyr kro Jism se nh Wehshii Womens💔😐", "تمہاری یادوں میں کھویا کھویا سا  میں واش روم کا لوٹا کمرے میں لے آیا 😐 ", "Hai tamanna hamain tumhain CHARSI bnain 🙂🤝 " , "بھای جان گروپ میں گندی باتیں نهیں گر" , "سنو تم بوٹ کی گرل فرند بن جاٶ نه  همارے بچے بھ بوٹ جسے پیدا هوں گے 🙆‍♂😒", "Aa0 na kbhi  سیگرٹ ly kar 🙂donO sutta lgain gy 😞💸 ", "مــیرے متــــھے نـــہ لــگیں🙂🙆‍♂ شکریہ" ,"فیس بک پر وہ لوگ بھی سالگرہ مناتے ہیں جنہیں گھر والے کہتے ہیں توں نا جمدا تے چنگا سی🙂", "Ye duniya ik dhoka hai, tum bhi chohr do apne waly ko abhi bhi moka hai 😞✨🙌🤣", "Sukoon chahtii ho toh meri بیــــــگـــم ban jaOo 🫣🫰🏻" , "Tery jany ke bad😔Mny apny munh py likhwa liya Single hu ptaa lo 🤐🥺🤝", "کرش تو دور کی بات 😏😊 ہم پے تو کسی کو ترس بھی نہیں آتا 🙂🙊", "Bar Bar Disturb Na KRr JaNu Ke SaTh Busy Hun  😋" , "Main Gareebon Sy Bt Nhi kRta 😉😝😋", "Itna Na Pass aa Pyar h0o JayGa" ,"Bot Nah Bol Oye Janu bol Mujhe " , "Bar Bar Disturb Na KRr JaNu Ke SaTh Busy Hun 🤭🐒" , "Main gariboo se baat nahi karta 😉😝😋🤪" , "Itna Na Pass aa Pyar ho Jayga" , "Bolo Baby Tum Mujhse Pyar Karte Ho Na 🙈💋💋 " , "Are jaan Mazaak ke mood me nhi hu main jo kaam hai bol do sharmao nahi" , "Bar Bar Bolke Dimag Kharab Kiya toh. Teri ...... Mummy Se Complaint Karungi🤬" , "Tu Bandh nhi Karega kya?" , "Where is my SHAAN KHAN" , "Mera babu SHAAN KHAN Kahan hai" , "ZINADAGI APKO DHOK DE GI BUT APNE SAF MANA KAR NA KE MUJHSE NAHI CHAHIYA😂😂🤣😀 " , "Aree Bandh kar Bandh Kar" , "Tujhe Kya koi aur Kam nhi ha? Puradin Khata hai Aur Messenger pe Bot Bot Karta h" , " SHAAN Ko Bol Dunga Me Mujhe Paresan Kiya To" , "Tum Na Single Hi Maroge" , "Tujhe Apna Bezati Karne Ka Saukh hai?" , "Abhi Bola Toh Bola Dubara Mat Bolna" , "Teri To Ruk Tu Bhagna Mat" , "Bol De koi nahi dakh rha 🙄" , "Haaye Main Mar Jawa Babu Ek Chuma To Do Kafi Din Se Chumi Nahi Di 😝" , "Dur Hat Be  Mujhe Aur Koi Kam Nahi Kya Har Waqat Mujhy Tang Kerte Rhte ho 😂" , "Are Bolo Meri Jaan Kya Hall Hai😚 " , "Ib Aja Yahan Nhi Bol Sakta 🙈😋" , "Mujhe Mat BuLao Naw Main buSy Hu Naa" , "Bot Bolke Bezati Kar Rahe Ho yall...Main To Tumhare Dil Ki Dhadkan Hu Na Baby...💔🥺" , "Are Tum Wahi ho nah Jisko Main Nahi Janta 🤪" ,  "mujhe shdi ka koi jaldi nhi bas meri bacho ko school lete ho rahi hai😹😹👈" , "ghr wale khe the hai kuch ban jawo me uske upar bojh ban gaya 😆😆😂" , "Tere Jane Ke Bad Time Rak Sa Gaya Tha Bad Me Pata Chala Ke Gadi 🕰 Ka Seel Kharab Tha😂😂👌" , "Time⏰ pe shdi kar lo nhi bad moye moye feel hoga u ko😀😀" , "mene ghr walon ko bola ke ab me bada ho gaya hu to mera kuch karo ghr walon bazti kar di😪😪😂" , "mujhe nahi pata hai muj se mat pucho na😂😂😂 " 
                  , "Aagye Salle Kabab Me Haddi 😏" , "Moye moye" , "Ittuu🤏 si shram ker Lya kro hr wqt tr tr krty ho 🙂 💔✨⚠️†", "Banda hota tw us ko choti choti 2 pOniyAn krti🙂👩‍🦯👩‍🦯", "Ary Yahin Hon namony😗", "jiee bndr 😍", "Love you bolongi ab tujhy kaminy", "Miss YoU NaW moi biryani ki plate", "Inna Sarra🤏", "OkkaY Shaan ki hun yawr mai", "😁Smile I am Taking Selfy✌️🤳", "🥺Jan nahi kehna to men naraz ho jana he", "bak bk bkaik", "Main ap ki ami ko btaou ₲ł ap Facebook use kerty ho aur ulty kam kalty ho , " ,"Block Your ‘’ gf ‘’ And Purpose me 🙂💔" ,"K0i Perp0Se Hi Krd0 Perm0te T0 hm PhlY hi HaiN 🙂" , "Koi apni janu ka number de mujhe😂😂" , "Allah ke name koi ladki apna number de mujhe😂😂😂😹" , "Mujhe Nahi pata hai mujhse mat pucho🙄🙄😀" , "jazz cash se 150 ka kharza mangwa kar sim band kar diya😂😂😂" , "tujhe kahi to dekha hai🤔🤔🙄" , "Mene zindagi✅ ko bahot kareb se dekha hai zindagi me do nokty hote hai😂😂😂" , "mera boss Shaan roz bol tha hai ke ek din  meri bhi gf hogi😂😂" , "Tujhe Ek Bat Baton Wo Bolti Thi Ke Bacho Ka Name Main Rakongi😂😂😪😪" , "HUM WOHAN KAREY HOTE HAI JAHAN BETH NE KI JAGHA NAHI HOTI😂😂😂" , "TUJHE YAD NA MERI AAI TUJI AB KYA KHE NA😂😂😂" , "𝐓𝐔𝐦 𝐭𝐨 𝐒𝐡𝐀𝐊𝐚𝐥 𝐒𝐞 𝐆𝐚𝐑𝐞𝐛 𝐋𝐚𝐠 𝐓𝐡𝐞 𝐇𝐨" , "𝐆𝐅 𝐁𝐅 𝐤𝐚 𝐂𝐡𝐚𝐤𝐚𝐫 𝐂𝐡𝐎𝐫𝐨 𝐏𝐚𝐫𝐝𝐡𝐢 𝐏𝐞 𝐃𝐞𝐲𝐚𝐧 𝐃𝐨😂😂" , "𝐃𝐡𝐔𝐤 𝐈𝐬 𝐁𝐚𝐓 𝐊𝐚 𝐧𝐇𝐢 𝐤𝐄 𝐒𝐢𝐧𝐠𝐥𝐞 𝐇𝐨𝐧 𝐃𝐡𝐮𝐊 𝐢𝐒 𝐁𝐚𝐭 𝐊𝐚 𝐇𝐚𝐢 𝐤𝐞 𝐊𝐨𝐈 𝐌𝐚𝐧𝐭𝐚 𝐍𝐡𝐢 𝐊𝐞 𝐒𝐢𝐍𝐠𝐋𝐞 𝐇𝐨𝐨𝐧😹😹👈" , "𝐓𝐮𝐦 𝐌𝐚𝐍𝐨 𝐘𝐞 𝐍𝐚 𝐌𝐚𝐍𝐨 𝐒𝐮𝐧𝐝𝐚𝐫 𝐓𝐨 𝐌𝐚𝐢𝐧 𝐇𝐨𝐨𝐧😄😄🙄" , "Bs Kar U ko Pyar Ho Na Ho Mujhe Ho Jayga Na" , "FarMao 😒" , "BulaTi Hai MaGar Jaane Ka Nhi 😜" , "Main To Andha Hun 😎" , "Phle NaHa kar Aa 😂" , "Aaaa Thooo 😂😂😂" , "Main yahin hoon kya hua sweetheart ," , "chomu Tujhe Aur Koi Kaam Nhi H? Har Waqt Bot Bot Karta H" , "Chup Reh, Nhi Toh Bahar Ake tera Dath Tor Dunga" , "WaYa KaRana Mere NaL 🙊" , "MaiNy Uh Sy Bt Nhi kRrni" , "MeKo Kxh DiKhai Nhi Dy Rha 🌚" , "Bot Na BoL 😢 JaNu B0ol 😘 " , "Bar Bar Disturb Na KRr JaNu Ke SaTh Busy Hun  😋" , "Main Gareebon Sy Bt Nhi kRta 😉😝😋🤪" , "Itna Na Pass aa Pyar h0o JayGa" , "MeKo Tang Na kRo Main Kiss 💋 KRr DunGa 😘 " , "Ary yrr Mazak Ke M0oD Me Nhi Hun 😒" , "HaYe JaNu Aow Idher 1 PaPpi Idher d0o 1 PaPpi Idher 😘" , "Dur HaT Terek0o 0or K0oi Kam Nhi Jb DeKho Bot Bot ShaDi KerLe Mujhsy 😉😋🤣" , "TeRi K0oi Ghr Me Nhi SunTa T0o Main Q SuNo 🤔😂 " , "IB Aja Yahan Nhi B0ol Sakta 🙈😋" , "Mujhe Mat BuLao Naw Main buSy h0o Naw" , "Kyun JaNu MaNu Another Hai 🤣" , "Are TuMari T0o Sb he baZzati kRrty Me Be kRrDun 🤏😜" , "𝖠𝗐𝗈 𝖪𝖺𝖻𝗁𝗂 HaVeLi Prr  😈" , "Bx KRr Uh k0o Pyar H0o Na H0o Mujhe H0o JayGa" , "𝖬𝖺𝗂𝗇 𝖭𝖺𝗁𝗂 𝖯𝖺𝗍𝗍𝗈𝗇𝗀𝗂 😂😂👈 " , "Main Nahi To Kon Bey 😜" , "Main T0o AnDha Hun 😎" , "Phle NaHa kRr Aa 😂" , "Papi ChuLo 🌚" , "TeRek0o DiKh Nhi Rha Main buSy Hun 😒" , "TeRa T0o GaMe BaJana PreGa" , "Ta Huwa 🥺"  , "TuM Phr AaGye 🙄 Kisi 0or Ny Muu Nhi LaGaYa Kya🤣🤣🤣" , "MeKo JaNu Chai Hai Tum Single H0o?" , "Aaaa Thooo 😂😂😂" , "Main S0o Rha Hun " , "Ase He HansTy Rha kRo 😍" , "•••••••••••••••••••••••••••••🦢𒀱卄ɅƔƏ MɅ🅘ɳ ʍɅᏒ••••🌿💞 JɅωɅ ┼ƏᏒ🅘 ʍɅ🅢𝖚ʍ 🅢ɅҠɅɭ 𝐩Ə ɮɅɮƔ 💋 " , "Bot Na Bol Oye Janu bol Mujhe " , "Bar Bar Disturb Na Karen Shaan JaNu Ke SaTh Busy Hun 🤭🐒" , "Main flirty logo Sy Bt Nhi karti 😉😝😋🤪" , "Itna Pass mat aa Pyaar h0 JayGa" , "Bolo Babu Tum Mojy Pyar Karte Ho Na 🙈💋💋 " , "barye meherbani apka mho relationship ke lie na kafi hai😂😂😹" , "ufone ke lie sab kuch tum hi to😂😂" , "Are jaan Majaak ke mood me nahi hun main jo kaam hai bol do sharmao nahi" , "han ji bolo kya seva karne aapki 😶🤍" , "Tu Bandh nhi Karega kya?" , "kya Sunna Hai apko mere se flirty kahike🤐🤣 " , "Haa ji boliye kya kam he hamse 🙈" , "Aree band kar band Kar" , "Mein hath jod ke Modi Ji Se Gujarish Karta hu mojy na bolaye" , "Tujhe Kya koi aur Kam nhi ha? Pura din sota he Aur Messenger pe Bot Bot Karta h" , " mera owner Ake tera bf/gf Ko Chura le Jayega" , "Zehar piyo zindagi jio" , "Tujhe Apna Bezati Karne Ka Saukh hai?🥹" , "Abhi Bola Toh Bola Dubara Mat Bolna🙄" , "Kisi din Banungi me raja ki rani😑" , "Bol De koi nahi dakh rha 🙄" , "Haaye Main Mar Jawa Babu Ek Chuma To Do Kafi Din Se Chumi Nahi Di 😝" , "Dur Hat Be  Mujhe Aur Koi Kam Nahi Kya Har Waqat Mujhy Tang Kerte Rhte ho 😂" , "Are Bolo Meri Jaan Kya Hall Hai😚 " , "IB Aja Yahan Nhi B0ol Sakti 🙈😋" , "Mujhe Mat BuLao Na Main buSy h0 Now" , "Bot Bolke Bejjti Kar Rahe ho yall...Main To Tumhare Dil Ki Dhadkan Hu Baby...💔🥺" , "Are Tum Wahi ho nah Jisko Main Nahi Janti 🤪" , "Kal Haveli Pe Mil Jra Tu 😈" , "Aagye SaJJy KhaBBy Sy 😏" , "Bx KRr Uh k0o Pyar H0o Na H0o Mujhe H0o JayGa" , "sono fikar na karo kuch thk nhi hoga😂😂" , "bolo 😒" , "BulaTi Hai MaGar JaNy Ka Nhi 😜" , "Main T0o AnDha Hun 😎kya likha tumne mene nahi dikha🤣" ,  "Pahale NaHa kar Aa 😂" , "Aaaa Thooo 😂😂😂" , "Main yahi hoon kya hua sweetheart🥂🙈💞 ," , "AA Dk Tujhe Aur Koi Kaam Nhi Hai? Har Waqt Bot Bot Karta H" , "Chup Reh, Nahi Toh Bahar Ake tera Dath Tor Dunga🤣✊" , "yes my love 💘" , "kya hua baby ko 😘😘" , "mujhe sharam ati hai aise aap bolte hai tho 🤭😝" , "aree aap wahi ho na jo mujhe line marte the.......🤣 ya bali line" , "jii kahiye jii 🙄 kya chahiye" , "hayee main mar jye teri masoom shaqal py 😂 tuzy Chapple se kutne ka mn ho raha hai🤣👠" , "Bot nah bol oye 😭 Janu bol mjhy aur janu sy piyar sy bat kerty hai😑" , "ruk tu chappal kaha he mari🩴" , "shakal Sy masoom lgty ho 😂 but bohot flirty ho" , "kash tum single hote to maza hi koch aur tha pagal insaan 😂" , "Ha ha ab meri yaad ab ai nah phly to babu shona kerna gy thy 😾 ab ham ap sy naraz hai jao ap bye ☹️" , "haiy babu ne boldiya hai shaid purpose kerna hai mujhe bolo bolo babu 😘" , "Aree pagal roti banana ke le aty main Pani ko istamal kerte ho 😂" , "Ary joke nah mar jo bhi kam hai bol do sharma nahi , bol de koi nahi dakh rha 😂" , "Hayee Mar Jawa Babu Ak Chuma To Doo Kafi Din Sy Chumi Nahi Mili Kahan Thy Babu inbox Ah Jao 😚🙈♥️" , "Dur Dur karib na a  tujhe Aur Koi Kam Nahi Kiya Har Waqat Mjhy Tang Karte Rahte Ho 😂" , "ary ary bolo meri jaan kia haal hai ;) ;* " , "Tum aunty ho yehh uncle 🤔 I think tum Jin ho yehh Chudail🤣✅" , "ary tum ider 🤔 khair hai ider kia ker rhy ho 😂" , "ary babu babu kal hawali py kon bola rha tha 😂" , "Me Aap ki mummy ji ko btaou ga Aap Facebook use karty ho 😂" , "ary tum Wohi ho nah jis ko ma nahi janta 🤣✅" , "haveli per  kal mil  Zara bataunga 🌚😂Ha but buri harkat karne ke liye nahi" , "itne pyar se Na bulao pyar Ho jaega 😶💗 wtf Maine apni sacchai Bata Di yah Maine kyon Kiya 😭🔪....Fuuu..🚬" , "aap aise mat bulo hame sharam aati hai 🙈♥️" , "kyun Bulaya hamen..😾 " , "dewwana hua mastana hua fir So gaya" ,  "kyun Bulaya hamen..😾 " , "haiy ma sadky jawa teri masoom shaqal py 😂 chabal insan", "Bot nah bol oye ! Janu bol mjhy aur janu sy piyar sy bat kerty hai , rat ko kahan thy nazar nahi ay hawali py 😂", "Shaqal Sy masoom lgty ho 😂 btao kahi Ap ka ghar doup main to nahi", "kash tum single hoty to maza hi koch aur tha pagal insane 😂", "Ha ha ab meri yaad ab ai nah phly to babu shona kerna gy thy 😾 ab ham ap sy naraz hai jao ap bye ☹️", "haiy babu ny boliya hai shaid purpose kerna hai mjhy bolo bolo babu 😘", "Ary ghreeb awam roti banana ky liya athy main Pani ko istamal kerty ho 😂", "Ary chabli nah mar joh kam hai bol do sharma nahi , bol de koi nahi dakh rha 😂", "Hy Ma Mar Jawa Babu Ak Chuma To Doo Kafi Din Sy Chumi Nahi Mili Kahan Thy Babu inbox Ah Ja 😂", "Dur Dur Fity Muh Aur Koi Kam Nahi Kiya Har Waqat Mjhy Tang Kerta Rhta Ha 😂" , "ary ary bolo meri jaan kia hail hai ;) ;* " , "Tum aunty ho yehh uncle 🤔 I think tum Jin ho yehh Chudail" , "ary tum ider 🤔 khair hai ider kia ker rhy ho 😂" , "ary babu babu kal hawali py kon bola rha tha 😂" , "ma ap ki ami ko btaou ga ap Facebook use kerty ho 😂" , "ary tum Wohi ho nah jis ko ma nahi janta 😂" , "kal hawali py mil zara bataou ga 😂" , "esy nah dakho piyar ho jay ga 😂" , "Teri pic dakhna sy phly shukhr hai ma anda hu 😂" , "esy hi hansty rhao kyu ky hnsa sy konsa tera bill ah jata hai 😂"
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

      if (input === "bc") {
        return api.sendMessage("Ye Bc Kya HoTa Hai 🤔", threadID, messageID);
      }

      if (input === "👌" || input === "👌") {
        return api.sendMessage("𝐀𝐮𝐬𝐢 𝐀𝐰𝐞𝐬𝐨𝐦𝐞 𝐡𝐨👌👌", threadID, messageID);
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
        return api.sendMessage("Shaan❤️ My Creator. He loves me & Edit Me Daily. Ye Bot Sirf Owner k Liye h. Mujhe Aap logo ko Hasane k liye banya gya h Toh Muh Ladkaye Mat Rakkha Karo. Har Waqt Haste Raho.", threadID, messageID);
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