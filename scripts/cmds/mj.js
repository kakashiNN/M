const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "mj",
    version: "2.0",
    author: "",
    countDown: 10,
    longDescription: {
      en: "Generate a Midjourney-style image and select U1–U4 individually.",
    },
    category: "ai",
    role: 2,
    guide: {
      en: "midjourney <prompt>\nGenerates 4 images combined and allows U1–U4 selection.",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args.length) return message.reply("Please provide a prompt to generate your image.");

    const prompt = encodeURIComponent(args.join(" "));
    const apiUrl = `https://dev.oculux.xyz/api/mj-proxy-pub?prompt=${prompt}&usePolling=false`;

    message.reply("⚡", async () => {
      try {
        const { data } = await axios.get(apiUrl);
        if (!data || !data.results || data.results.length < 4) {
          return message.reply("⚠ The API didn’t return enough images.");
        }

        // Load all 4 images into Jimp
        const images = await Promise.all(data.results.slice(0, 4).map(url => Jimp.read(url)));

        // Assume all images are the same size
        const w = images[0].bitmap.width;
        const h = images[0].bitmap.height;

        // Create a new image 2x2
        const combined = new Jimp(w * 2, h * 2);

        combined.composite(images[0], 0, 0);
        combined.composite(images[1], w, 0);
        combined.composite(images[2], 0, h);
        combined.composite(images[3], w, h);

        const combinedPath = path.join(__dirname, `mj_combined.png`);
        await combined.writeAsync(combinedPath);

        // Send combined image
        api.sendMessage(
          { body: "Midjourney images combined ✨\n\n❏ Action: U1, U2, U3, U4", attachment: fs.createReadStream(combinedPath) },
          event.threadID,
          (err, info) => {
            if (err) return console.error("Error sending combined image:", err);
          }
        );

      } catch (error) {
        console.error("API Error:", error.message);
        message.reply("failed");
      }
    });
  },
};
