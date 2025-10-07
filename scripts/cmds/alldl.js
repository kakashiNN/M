const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

// Upload to Catbox
const uploadToCatbox = async (filePath) => {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(filePath));

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
  });

  return res.data; // Catbox link
};

module.exports = {
  config: {
    name: "autodl",
    version: "2.1.0",
    author: "Dipto",
    modified: "Style + Catbox by NIROB",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download video from TikTok, Facebook, Instagram, YouTube, Twitter/X and more ✨",
    },
    category: "✦ Mᴇᴅɪᴀ ✦",
    guide: {
      en: "[video_link]",
    },
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    let dipto = event.body ? event.body.trim() : "";

    try {
      if (
        dipto.startsWith("https://vt.tiktok.com") ||
        dipto.startsWith("https://www.tiktok.com/") ||
        dipto.startsWith("https://www.facebook.com") ||
        dipto.startsWith("https://www.instagram.com/") ||
        dipto.startsWith("https://youtu.be/") ||
        dipto.startsWith("https://youtube.com/") ||
        dipto.startsWith("https://x.com/") ||
        dipto.startsWith("https://twitter.com/") ||
        dipto.startsWith("https://vm.tiktok.com") ||
        dipto.startsWith("https://fb.watch")
      ) {
        // Wait msg
        api.sendMessage("Ｊｕｓｔ  ａ  ｓｅｃ… !!!", event.threadID, async (err, waitMsg) => {
          api.setMessageReaction("🖤", event.messageID, () => {}, true);

          const path = __dirname + `/cache/diptoo.mp4`;

          const { data } = await axios.get(
            `${await baseApiUrl()}/alldl?url=${encodeURIComponent(dipto)}`
          );

          const vid = (
            await axios.get(data.result, { responseType: "arraybuffer" })
          ).data;

          fs.writeFileSync(path, Buffer.from(vid));

          // Upload to Catbox
          const catboxUrl = await uploadToCatbox(path);

          // ✅ react
          api.setMessageReaction("✅", event.messageID, () => {}, true);

          // unsend wait msg
          if (waitMsg) api.unsendMessage(waitMsg.messageID);

          // Title
          const videoTitle =
            data.cp || data.title || data.caption || data.desc || "Untitled";

          // Styled Message
          const styledMessage =
`━━━⚡ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 ⚡━━━

📀 Title ➤ ${videoTitle}
🔗 Link ➤ ${catboxUrl}

━━━👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 👑━━━
✨ Name ➤ ＮＩＲＯＢ
🌐 Facebook ➤ facebook.com/hatake.kakashi.NN
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

          // Send final msg + video
          api.sendMessage(
            {
              body: styledMessage,
              attachment: fs.createReadStream(path),
            },
            event.threadID,
            () => fs.unlinkSync(path),
            event.messageID
          );
        });
      }
    } catch (e) {
      api.setMessageReaction("❎", event.messageID, () => {}, true);
      api.sendMessage(`⚠ Error: ${e.message}`, event.threadID, event.messageID);
    }
  },
};
