const axios = require("axios");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs-extra");

// 🛑 Owner UID
const OWNER_ID = "100089049681823"; 

module.exports.config = {
  name: "dog",
  version: "2.0.0",
  author: "Kakashi (Modified for Nirob Handler)",
  cooldowns: 5,
  role: 0, // 0 = all users
  shortDescription: "Turns someone into a dog!",
  longDescription: "Turns mentioned/replied user into a dog 🐶",
  category: "fun",
  guide: {
    en: "{pn} @mention or reply"
  }
};

module.exports.onStart = async function ({ api, event, message, usersData }) {
  try {
    let targetID = Object.keys(event.mentions || {})[0];
    if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("🐶 Please tag or reply to someone to turn them into a dog!");
    }

    // 🛑 Owner Protection
    if (targetID === OWNER_ID) {
      return message.reply("ভাগ ভিখারি!! আসছে আমার boss রে dog বানাতে ❌");
    }

    const base = path.join(__dirname, "..", "resources");
    const bgPath = path.join(base, "dog.png");
    const avatarPath = path.join(base, `avatar_${targetID}.png`);
    const outputPath = path.join(base, `dog_${targetID}.png`);

    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

    // Download dog template if not exists
    if (!fs.existsSync(bgPath)) {
      const resp = await axios.get(
        "https://raw.githubusercontent.com/kakashiNN/FUNNY-PHOTOS-/main/Dog2.jpeg",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(bgPath, resp.data);
    }

    // Download user avatar
    const avatarResp = await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(avatarPath, avatarResp.data);

    // Process image with jimp
    const bg = await jimp.read(bgPath);
    const avatar = await jimp.read(avatarPath);
    avatar.resize(200, 200).circle();

    // Composite avatar on dog template
    const x = 280;
    const y = 400;
    bg.composite(avatar, x, y);

    await bg.writeAsync(outputPath);

    const userInfo = await usersData.get(targetID);
    const name = userInfo?.name || "Someone";

    await message.reply({
      body: `🤣 ${name} এখন একেবারে আসল কুকুর! 🐶`,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(outputPath)
    });

    // cleanup
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(outputPath);

  } catch (e) {
    console.error("Dog command error:", e);
    return message.reply("❌ | Something went wrong while generating the dog image.");
  }
};
