const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "ytdl",
    aliases: ["yt"],
    version: "3.0",
    author: "NIROB",
    role: 0,
    category: "media",
    guide: { en: "{pn} <youtube link>" }
  },

  onStart: async function ({ message, args }) {
    const url = args.join(" ");

    if (!url)
      return message.reply("❌ YouTube link missing");

    if (!/(youtube\.com|youtu\.be)/i.test(url))
      return message.reply("❌ Only YouTube links allowed");

    try {
      await message.reply("⏳ Downloading video, please wait...");

      const res = await axios.get(
        "https://nirob-ytdl-apis.vercel.app/api/ytdl",
        {
          params: { url },
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0" }
        }
      );

      if (res.data.status !== "success")
        return message.reply("❌ API failed");

      const data = res.data.data;
      const videos = data.format_options.video.mp4;

      // 🎯 pick best video with audio
      let selected =
        videos.find(v => v.hasAudio && v.quality.includes("720")) ||
        videos.find(v => v.hasAudio);

      if (!selected)
        return message.reply("❌ No video with audio found");

      const filePath = path.join(
        __dirname,
        `/cache_${Date.now()}.mp4`
      );

      // ⬇️ download video
      const videoStream = await axios({
        url: selected.url,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      videoStream.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `🎬 ${data.title}\n⏱ ${data.lengthSeconds}s`,
          attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);
      });

      writer.on("error", () => {
        message.reply("❌ Video download failed");
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error while sending video");
    }
  }
};
