const axios = require("axios");

module.exports = {
  config: {
    name: "ytdl",
    aliases: ["yt"],
    version: "2.0",
    author: "NIROB",
    role: 0,
    category: "media",
    guide: { en: "{pn} <youtube link>" }
  },

  onStart: async function ({ message, args }) {
    try {
      const url = args.join(" ");

      if (!url)
        return message.reply("❌ YouTube link missing");

      if (!/(youtube\.com|youtu\.be)/i.test(url))
        return message.reply("❌ Only YouTube links allowed");

      const res = await axios.get(
        "https://nirob-ytdl-apis.vercel.app/api/ytdl",
        {
          params: { url },
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0" }
        }
      );

      if (!res.data || res.data.status !== "success")
        return message.reply("❌ API failed");

      const data = res.data.data;

      let msg = `🎬 ${data.title}\n`;
      msg += `⏱ ${data.lengthSeconds}s\n\n`;
      msg += `📥 Download Links:\n`;

      const videos = data.format_options.video.mp4;

      videos.forEach(v => {
        msg += `• ${v.quality}${v.hasAudio ? " 🔊" : ""}\n${v.url}\n\n`;
      });

      return message.reply(msg);

    } catch (err) {
      console.error("YTDL ERROR:", err.message);
      return message.reply("❌ Error: " + err.message);
    }
  }
};
