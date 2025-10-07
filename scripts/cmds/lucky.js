const cooldowns = new Map();

module.exports = {
  config: {
    name: "lucky",
    version: "3.0",
    author: "NIROB",
    countDown: 10,
    shortDescription: { en: "🍀 Spin your luck & win money!" },
    longDescription: { en: "Test your fortune by spinning the wheel of luck 💫" },
    category: "game"
  },

  langs: {
    en: {
      result: "🍀 𝐓𝐡𝐞 𝐬𝐩𝐢𝐧 𝐬𝐭𝐨𝐩𝐬 𝐚𝐭 **%1** — %2",
      win: "🎉 𝐘𝐨𝐮 𝐰𝐨𝐧 **$%1.5** 💰",
      lose: "💔 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 **$%1** 😿"
    }
  },

  onStart: async function ({ message, event, usersData, getLang }) {
    const { senderID } = event;
    const outcomes = [
      { name: "💎 Diamond", value: 5000 },
      { name: "🍋 Lemon", value: -1000 },
      { name: "💰 Gold", value: 3000 },
      { name: "💀 Skull", value: -2000 },
      { name: "⭐ Star", value: 8000 },
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    const userData = await usersData.get(senderID);
    await usersData.set(senderID, { money: userData.money + result.value, data: userData.data });

    const msg = result.value > 0
      ? `${getLang("result", result.name, "Lucky hit!")} \n${getLang("win", formatMoney(result.value))}`
      : `${getLang("result", result.name, "Unlucky...")} \n${getLang("lose", formatMoney(-result.value))}`;

    return message.reply(msg);
  }
};

function formatMoney(a) {
  if (a >= 1e9) return (a / 1e9).toFixed(2) + "𝗕";
  if (a >= 1e6) return (a / 1e6).toFixed(2) + "𝐌";
  if (a >= 1e3) return (a / 1e3).toFixed(2) + "𝗞";
  return a.toString();
}
