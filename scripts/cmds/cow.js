const axios = require("axios");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "cow",
    version: "1.0.1",
    author: " NIROB",
    countDown: 5,
    role: 0,
    shortDescription: "Cow meme 🐄",
    longDescription: "Replaces cow face with a user's avatar",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to turn them into a cow",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("🐄 Tag or reply to someone to make them a cow!");

    // 🛡️ Owner Protect System (UID List)
    const ownerUIDs = ["100089049681823", ""]; // তোমার/owner UID
    if (ownerUIDs.includes(targetID)) {
      return message.reply("আইছে আমার boss রে cow বানাতে পারব না 🐄🦶।");
    }

    const baseFolder = path.join(__dirname, "NAFIJ_cow");
    const bgPath = path.join(baseFolder, "cow_bg.jpeg");
    const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
    const outputPath = path.join(baseFolder, `cow_result_${targetID}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      const cowImageURL = "https://files.catbox.moe/xt8tg0.jpg"; // your custom cow image
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(cowImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(avatarPath, avatarBuffer);

      const bg = await jimp.read(bgPath);
      const avatar = await jimp.read(avatarPath);

      avatar.resize(100, 100).circle();

      const x = 210;
      const y = 80;

      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      await message.reply(
        {
          body: `🤣 ${name} is now a cow! 🐄`,
          mentions: [{ tag: name, id: targetID }],
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("🐄 Cow command error:", err);
      if (err.response && err.response.status === 404) {
        return message.reply("❌ Error: Could not download the cow background image. Please check the URL.");
      }
      return message.reply("❌ Error while turning into cow.");
    }
  },
};
