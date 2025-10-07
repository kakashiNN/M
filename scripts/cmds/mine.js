module.exports = {
  config: {
    name: "mine",
    version: "3.0",
    author: "NIROB",
    countDown: 10,
    shortDescription: { en: "💣 Avoid the mine & win money!" },
    longDescription: { en: "Choose 1-3 and try not to hit the mine 💫" },
    category: "game"
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;
    const num = parseInt(args[0]);
    if (isNaN(num) || num < 1 || num > 3) return message.reply("⚠️ Usage: /mine <1-3>");
    const mine = Math.floor(Math.random() * 3) + 1;
    const userData = await usersData.get(senderID);

    if (num === mine) {
      await usersData.set(senderID, { money: userData.money - 2000, data: userData.data });
      return message.reply(`💣 Boom! You hit the mine 😿\n💔 Lost **$2000**`);
    } else {
      await usersData.set(senderID, { money: userData.money + 4000, data: userData.data });
      return message.reply(`🎉 Safe choice! Mine was ${mine}\n💰 You won **$4000**`);
    }
  }
};
