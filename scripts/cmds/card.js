const cooldowns = new Map();

module.exports = {
  config: {
    name: "card",
    version: "3.0",
    author: "NIROB",
    countDown: 10,
    shortDescription: { en: "🃏 Flip a card & win money!" },
    longDescription: { en: "Pick a random card & see if it’s lucky 💫" },
    category: "game"
  },

  langs: {
    en: {
      draw: "🃏 𝐘𝐨𝐮 𝐝𝐫𝐞𝐰 **%1** — %2 💰",
      win: "🎉 𝐖𝐨𝐰! 𝐘𝐨𝐮 𝐰𝐨𝐧 **$%1**",
      lose: "💔 𝐒𝐨𝐫𝐫𝐲, 𝐲𝐨𝐮 𝐥𝐨𝐬𝐭 **$%1**"
    }
  },

  onStart: async function ({ message, event, usersData, getLang }) {
    const { senderID } = event;
    const cards = ["♥️", "♠️", "♦️", "♣️"];
    const values = [10, 50, 100, 500, 1000, 5000];
    const win = Math.random() < 0.5;

    const value = values[Math.floor(Math.random() * values.length)];
    const card = cards[Math.floor(Math.random() * cards.length)];

    const userData = await usersData.get(senderID);
    const amount = win ? value : -value;
    await usersData.set(senderID, { money: userData.money + amount, data: userData.data });

    const msg = win
      ? `${getLang("draw", card, "It's a lucky card!")} \n${getLang("win", formatMoney(value))}`
      : `${getLang("draw", card, "Bad luck!")} \n${getLang("lose", formatMoney(value))}`;
    return message.reply(msg);
  }
};

function formatMoney(a) {
  if (a >= 1e9) return (a / 1e9).toFixed(2) + "𝗕";
  if (a >= 1e6) return (a / 1e6).toFixed(2) + "𝐌";
  if (a >= 1e3) return (a / 1e3).toFixed(2) + "𝗞";
  return a.toString();
}
