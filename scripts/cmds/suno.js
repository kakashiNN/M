const axios = require("axios");

module.exports = {
  config: {
    name: "suno",
    version: "3.3",
    author: "@RI F AT",
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI song with Suno",
    longDescription: "Generate AI songs in auto or custom mode using Suno API. Supports song selection if multiple results.",
    category: "media",
    guide: {
      en: "{pn} <style>\n{pn} <title>|<lyrics>|<gender>|<style>"
    }
  },

  onStart: async function ({ message, event, args, commandName }) {
    if (!args[0]) {
      return message.reply(
        "❌ Provide a style or custom input!\n\n" +
        "👉 Example (auto mode): /suno pop\n" +
        "👉 Example (custom mode): /suno My Song|This is AI lyrics|male|rock"
      );
    }

    const input = args.join(" ");
    let url, mode;

    if (input.includes("|")) {
      const [title, lyrics, gender = "female", style = "pop"] = input
        .split("|")
        .map(e => e.trim());
      url = `https://areh-suno-5oe3.onrender.com/song/custom?title=${encodeURIComponent(
        title
      )}&lyrics=${encodeURIComponent(lyrics)}&gender=${encodeURIComponent(
        gender
      )}&style=${encodeURIComponent(style)}`;
      mode = "custom";
    } else {
      const style = input.trim();
      url = `https://areh-suno-5oe3.onrender.com/song/auto?style=${encodeURIComponent(
        style
      )}&gender=female`;
      mode = "auto";
    }

    try {
      await message.reply("🎶 Generating song, please wait...");

      const res = await axios.get(url, { timeout: 600000 });
      const data = res.data;

      if (!data.success || !data.songs?.length) {
        return message.reply("❌ Failed to generate song.");
      }

      const songs = data.songs;

      if (songs.length > 1) {
        let list = `🎶 Suno AI (${mode.toUpperCase()} Mode)\nChoose a song by replying with its number:\n\n`;
        songs.forEach((s, i) => {
          list += `${i + 1}. ${s.title}\n`;
        });

        message.reply(list, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              type: "chooseSong",
              author: event.senderID,
              songs,
              mode,
              messageID: info.messageID
            });
          }
        });

      } else {
        const song = songs[0];
        await sendSong(message, song, mode);
      }

    } catch (err) {
      console.error("❌ Suno cmd error:", err);
      message.reply("⚠️ Error while generating song.\n" + err.message);
    }
  },

  onReply: async function ({ message, event, Reply, args }) {
    if (Reply.type === "chooseSong") {
      if (event.senderID !== Reply.author) return;

      const choice = parseInt(args[0]);
      if (isNaN(choice) || choice < 1 || choice > Reply.songs.length) {
        return message.reply("❌ Invalid choice. Please reply with a valid number.");
      }

      const song = Reply.songs[choice - 1];
      await sendSong(message, song, Reply.mode);

      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};

async function sendSong(message, song, mode) {
  if (song.lyrics) {
    const lyricsText =
      `🎶 Suno AI (${mode.toUpperCase()} Mode)` +
      `\n🎵 Title: ${song.title}` +
      `\n📝 Lyrics:\n${song.lyrics}`;
    await message.reply(lyricsText);
  } else {
    await message.reply(`🎶 Suno AI (${mode.toUpperCase()} Mode)\n🎵 Title: ${song.title}`);
  }

  await message.reply({
    attachment: await global.utils.getStreamFromUrl(song.mp3_url)
  });
}
