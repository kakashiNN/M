const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    author: "Tokodori",
    version: "2.5.0",
    role: 0,
    shortDescription: "Show bot owner info",
    longDescription: "Display styled info about the bot owner using symbols",
    category: "ADMIN",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const owner = {
        name: 'NIROB',
        age: '19',
        nick: 'KAKASHI',
        identity: 'TIME TRAVELER',
        hobby: 'CODING',
        location: 'DHAKA',
        status: 'ACTIVE'
      };

      const videoURL = 'https://files.catbox.moe/026g5j.mp4';
      const tempPath = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);

      const videoData = await axios.get(videoURL, { responseType: 'arraybuffer' });
      const videoPath = path.join(tempPath, 'owner.mp4');
      fs.writeFileSync(videoPath, Buffer.from(videoData.data, 'binary'));

      const msg = `
───〈 ＯＷＮＥＲ  ＩＮＦＯ 〉───

    ⌬  Ｎａｍｅ      ⁚  ${owner.name}
    ⌬  Ａｇｅ       ⁚  ${owner.age}
    ⌬  Ｎｉｃｋ     ⁚  ${owner.nick}
    ⌬  Ｉｄｅｎｔｉｔｙ ⁚  ${owner.identity}
    ⌬  Ｈｏｂｂｙ     ⁚  ${owner.hobby}
    ⌬  Ｌｏｃａｔｉｏｎ ⁚  ${owner.location}
    ⌬  Ｓｔａｔｕｓ   ⁚  ${owner.status}

───〈 ＳＹＳＴＥＭ  ＯＦＦ 〉───

「 Ｍｙ Ｂｏｔ • Ｙｏｕｒ Ｃｏｍｆｏｒｔ 」
`;

      await api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, (err) => {
          if (err) console.error(err);
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }, event.messageID);

    } catch (e) {
      console.error("OWNER CMD ERR:", e);
      return api.sendMessage("⚠️ System Error: Unable to fetch owner details.", event.threadID);
    }
  },
};
