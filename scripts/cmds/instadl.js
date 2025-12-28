const axios = require("axios");

module.exports = {
  name: "insta",
  version: "1.0.0",
  role: 0,
  author: "annihilation BD",
  description: "Download Instagram video",
  category: "media",
  usage: "insta <instagram link>",

  async onStart({ api, event, args }) {
    try {
      const url = args[0];

      // ❌ URL missing
      if (!url) {
        return api.sendMessage(
          "❌ Instagram video link dao\n\nExample:\ninsta https://www.instagram.com/reel/xxxx",
          event.threadID,
          event.messageID
        );
      }

      // ❌ Not Instagram link
      if (!url.includes("instagram.com")) {
        return api.sendMessage(
          "❌ Eta Instagram link na",
          event.threadID,
          event.messageID
        );
      }

      // 🔗 API call
      const apiUrl = `https://nirob-api-insta.vercel.app/api/insta?url=${encodeURIComponent(
        url
      )}`;

      const res = await axios.get(apiUrl);

      // ❌ Invalid API response
      if (!res.data || typeof res.data !== "string") {
        console.error("API RESPONSE ERROR:", res.data);
        return api.sendMessage(
          "❌ Video fetch korte parini",
          event.threadID,
          event.messageID
        );
      }

      const videoUrl = res.data;

      // 📤 Send video
      await api.sendMessage(
        {
          body: "✅ Instagram video download complete 🎥",
          attachment: await global.utils.getStreamFromURL(videoUrl),
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("INSTAGRAM DOWNLOAD ERROR:", err);
      api.sendMessage(
        "❌ Error hoise\nConsole check koro",
        event.threadID,
        event.messageID
      );
    }
  },
};
