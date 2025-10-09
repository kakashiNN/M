const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "pair",
        version: "2.0",
        author: "Remodified by NIROB ",
        countDown: 5,
        role: 0,
        category: "LOVE",
    },

    onStart: async function ({ api, event }) {
        let pathImg = __dirname + "/cache/pair_bg.png";
        let pathAvt1 = __dirname + "/cache/pair_avt1.png";
        let pathAvt2 = __dirname + "/cache/pair_avt2.png";

        const id1 = event.senderID;
        const name1 = (await api.getUserInfo(id1))[id1].name;

        const threadInfo = await api.getThreadInfo(event.threadID);
        const all = threadInfo.userInfo;
        const botID = api.getCurrentUserID();

        let gender1;
        for (let u of all) if (u.id == id1) gender1 = u.gender;

        let candidates = [];
        if (gender1 === "FEMALE") {
            candidates = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
        } else if (gender1 === "MALE") {
            candidates = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
        } else {
            candidates = all.filter(u => u.id !== id1 && u.id !== botID).map(u => u.id);
        }

        if (!candidates.length)
            return api.sendMessage("😿 No suitable partner found for pairing.", event.threadID);

        const id2 = candidates[Math.floor(Math.random() * candidates.length)];
        const name2 = (await api.getUserInfo(id2))[id2].name;

        // --- Random match rate system ---
        const randomNums = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
        const extra = ["-𝟭", "𝟵𝟵.𝟵𝟵", "𝟭𝟵", "∞", "𝟭𝟬𝟭", "𝟬.𝟬𝟭"];
        const matchRate = [...randomNums, ...extra][Math.floor(Math.random() * (randomNums.length + extra.length))];

        const notes = [
            "𝗘𝘃𝗲𝗿𝘆 𝘁𝗶𝗺𝗲 𝗜 𝘀𝗲𝗲 𝘆𝗼𝘂, 𝗺𝘆 𝗵𝗲𝗮𝗿𝘁 𝘀𝗸𝗶𝗽𝘀 𝗮 𝗯𝗲𝗮𝘁.",
            "𝗬𝗼𝘂’𝗿𝗲 𝗺𝘆 𝘁𝗼𝗱𝗮𝘆 𝗮𝗻𝗱 𝗮𝗹𝗹 𝗼𝗳 𝗺𝘆 𝘁𝗼𝗺𝗼𝗿𝗿𝗼𝘄𝘀.",
            "𝗜𝗻 𝘆𝗼𝘂𝗿 𝘀𝗺𝗶𝗹𝗲, 𝗜 𝘀𝗲𝗲 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝗺𝗼𝗿𝗲 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝘁𝗵𝗮𝗻 𝘁𝗵𝗲 𝘀𝘁𝗮𝗿𝘀.",
            "𝗬𝗼𝘂 𝗺𝗮𝗸𝗲 𝗺𝘆 𝗵𝗲𝗮𝗿𝘁 𝗿𝗮𝗰𝗲 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗲𝘃𝗲𝗻 𝘁𝗿𝘆𝗶𝗻𝗴.",
            "𝗘𝘃𝗲𝗿𝘆 𝗹𝗼𝘃𝗲 𝘀𝘁𝗼𝗿𝘆 𝗶𝘀 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹, 𝗯𝘂𝘁 𝗼𝘂𝗿𝘀 𝗶𝘀 𝗺𝘆 𝗳𝗮𝘃𝗼𝗿𝗶𝘁𝗲.",
            "𝗬𝗼𝘂’𝗿𝗲 𝗺𝘆 𝗳𝗮𝘃𝗼𝗿𝗶𝘁𝗲 𝗽𝗹𝗮𝗰𝗲 𝘁𝗼 𝗴𝗼 𝘄𝗵𝗲𝗻 𝗺𝘆 𝗺𝗶𝗻𝗱 𝘀𝗲𝗮𝗿𝗰𝗵𝗲𝘀 𝗳𝗼𝗿 𝗽𝗲𝗮𝗰𝗲.",
            "𝗬𝗼𝘂𝗿 𝗲𝘆𝗲𝘀 𝗵𝗼𝗹𝗱 𝘁𝗵𝗲 𝗸𝗲𝘆 𝘁𝗼 𝗺𝘆 𝘀𝗼𝘂𝗹.",
            "𝗜 𝗱𝗶𝗱𝗻’𝘁 𝗰𝗵𝗼𝗼𝘀𝗲 𝘆𝗼𝘂, 𝗺𝘆 𝗵𝗲𝗮𝗿𝘁 𝗱𝗶𝗱.",
            "𝗪𝗶𝘁𝗵 𝘆𝗼𝘂, 𝗲𝘃𝗲𝗿𝘆 𝗺𝗼𝗺𝗲𝗻𝘁 𝗯𝗲𝗰𝗼𝗺𝗲𝘀 𝗮 𝗺𝗲𝗺𝗼𝗿𝘆.",
            "𝗬𝗼𝘂’𝗿𝗲 𝘁𝗵𝗲 𝗿𝗲𝗮𝘀𝗼𝗻 𝗜 𝗯𝗲𝗹𝗶𝗲𝘃𝗲 𝗶𝗻 𝗹𝗼𝘃𝗲."
        ];
        const lovelyNote = notes[Math.floor(Math.random() * notes.length)];

        // Background image
        const bgURL = "https://i.postimg.cc/nrgPFtDG/Picsart-25-08-12-20-22-41-970.png";

        // Download avatars and background
        const avt1 = (await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));

        const avt2 = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));

        const bg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

        // Read all images with jimp
        const background = await jimp.read(pathImg);
        const avatar1 = await jimp.read(pathAvt1);
        const avatar2 = await jimp.read(pathAvt2);

        // Resize avatars to fit nicely
        avatar1.resize(300, 300);
        avatar2.resize(300, 300);

        // Composite avatars onto background
        background.composite(avatar1, 120, 170);
        background.composite(avatar2, background.bitmap.width - 420, 170);

        // Save final image
        await background.writeAsync(pathImg);

        // Cleanup avatar cache
        fs.removeSync(pathAvt1);
        fs.removeSync(pathAvt2);

        const kawaiiMessage = `
🌸💞 *Cᴏɴɢʀᴀᴛᴜʟᴀᴛɪᴏɴs* 💞🌸  
@${name1} ＆ @${name2} ✨

💖 *Mᴀᴛᴄʜ Rᴀᴛᴇ:* ${matchRate}% 💖

🌷 𝓛𝓸𝓿𝓮𝓵𝔂 𝓝𝓸𝓽𝓮 🌷  
❝ ${lovelyNote} ❞

💫 𝒀𝒐𝒖 𝒂𝒓𝒆 𝒎𝒚 𝒔𝒖𝒏𝒔𝒉𝒊𝒏𝒆! 💫
`;

        return api.sendMessage(
            {
                body: kawaiiMessage,
                mentions: [
                    { tag: name1, id: id1 },
                    { tag: name2, id: id2 }
                ],
                attachment: fs.createReadStream(pathImg),
            },
            event.threadID,
            () => fs.unlinkSync(pathImg),
            event.messageID
        );
    },
};
