const cooldowns = new Map();

module.exports = {
  config: {
    name: "fish",
    version: "3.0",
    author: "NIROB",
    countDown: 10,
    shortDescription: { en: "🎣 Go fishing & earn coins!" },
    longDescription: { en: "Try your luck fishing — maybe you’ll catch a big one or nothing at all!" },
    category: "game"
  },

  langs: {
    en: {
      limit: "❌ | 𝐅𝐢𝐬𝐡𝐢𝐧𝐠 𝐥𝐢𝐦𝐢𝐭 𝐫𝐞𝐚𝐜𝐡𝐞𝐝! 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 %1.",
      catch: "🎣 𝐘𝐨𝐮 𝐜𝐚𝐮𝐠𝐡𝐭 𝐚 **%1** 𝐰𝐨𝐫𝐭𝐡 **$%2** 💰",
      fail: "😿 𝐍𝐨𝐭𝐡𝐢𝐧𝐠 𝐛𝐢𝐭𝐞𝐬... 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 **$%1**"
    }
  },

  onStart: async function ({ message, event, usersData, getLang }) {
    const { senderID } = event;
    const now = Date.now(), limit = 20, interval = 60 * 60 * 1000;
    if (!cooldowns.has(senderID)) cooldowns.set(senderID, []);
    const timestamps = cooldowns.get(senderID).filter(ts => now - ts < interval);

    if (timestamps.length >= limit) {
      const nextUse = new Date(Math.min(...timestamps) + interval);
      const diff = nextUse - now, h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
      return message.reply(getLang("limit", `${h}𝐡 ${m}𝐦`));
    }

    const fishes = [
      { name: "🐟 Small Fish", value: 500 },
      { name: "🐠 Tropical Fish", value: 1000 },
      { name: "🦐 Shrimp", value: 1500 },
      { name: "🦞 Lobster", value: 2000 },
      { name: "🦈 Shark", value: 5000 },
      { name: "🪱 Nothing", value: 0 }
    ];

    const userData = await usersData.get(senderID);
    const caught = fishes[Math.floor(Math.random() * fishes.length)];

    if (caught.value === 0) {
      await usersData.set(senderID, { money: userData.money - 500, data: userData.data });
      return message.reply(getLang("fail", 500));
    }

    await usersData.set(senderID, { money: userData.money + caught.value, data: userData.data });
    cooldowns.set(senderID, [...timestamps, now]);
    return message.reply(getLang("catch", caught.name, formatMoney(caught.value)));
  }
};

function formatMoney(a) {
  if (a >= 1e9) return (a / 1e9).toFixed(2) + "𝗕";
  if (a >= 1e6) return (a / 1e6).toFixed(2) + "𝐌";
  if (a >= 1e3) return (a / 1e3).toFixed(2) + "𝗞";
  return a.toString();
                                   }
