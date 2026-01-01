const axios = require("axios");

module.exports = {
  config: {
    name: "yt",
    aliases: ["ytdl", "youtube"],
    version: "1.0",
    author: "NIROB",
    countDown: 5,
    role: 0,
    shortDescription: "YouTube video downloader",
    longDescription: "Download videos using YouTube links only",
    category: "media",
    guide: {
      en: "{pn} <youtube link>"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const url = args[0];

      if (!url) {
        return message.reply("❌ Please provide a YouTube link");
      }

      // ✅ YouTube-only validation
      const ytRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;

      if (!ytRegex.test(url)) {
        return message.reply("❌ Only YouTube links are supported");
      }

      const apiUrl = `https://nirob-ytdl-apis.vercel.app/api/ytdl?url=${encodeURIComponent(
        url
      )}`;

      const res = await axios.get(apiUrl, {
        timeout: 15000
      });

      if (!res.data || res.data.status !== "success") {
        return message.reply("❌ Failed to fetch video info");
      }

      const data = res.data;

      let text = `🎬 Title: ${data.title}\n`;
      text += `👤 Author: ${data.author}\n\n`;
      text += `📥 Download Links:\n`;

      data.videos.forEach(v => {
        text += `• ${v.quality} → ${v.url}\n`;
      });

      return message.reply(text);

    } catch (err) {
      return message.reply("❌ Error while processing the YouTube link");
    }
  }
};
