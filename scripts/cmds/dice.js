const cooldowns = new Map();

module.exports = {
  config: {
    name: "dice",
    version: "3.0",
    author: "NIROB",
    countDown: 10,
    shortDescription: { en: "🎲 Roll the dice and test your luck!" },
    longDescription: { en: "Roll a dice and win or lose money based on your luck 💫" },
    category: "game"
  },

  langs: {
    en: {
      invalid_amount: "⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 💅",
      not_enough_money: "💸 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 😿",
      limit_reached: "❌ | 𝐘𝐨𝐮 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐝𝐢𝐜𝐞 𝐥𝐢𝐦𝐢𝐭! 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 %1.",
      win: "🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝 **%1**!\n🎉 𝐘𝐨𝐮 𝐰𝐨𝐧 **$%2.5** 💰",
      lose: "🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝 **%1**!\n💔 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 **$%1.5** 😿"
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const amount = parseInt(args[0]);
    const now = Date.now(), limit = 20, interval = 60 * 60 * 1000;
    if (!cooldowns.has(senderID)) cooldowns.set(senderID, []);
    const timestamps = cooldowns.get(senderID).filter(ts => now - ts < interval);

    if (timestamps.length >= limit) {
      const nextUse = new Date(Math.min(...timestamps) + interval);
      const diff = nextUse - now, h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
      return message.reply(getLang("limit_reached", `${h}𝐡 ${m}𝐦`));
    }

    if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid_amount"));
    if (amount > 100000000) return message.reply("❌ | The maximum bet amount is 100M.");
    const userData = await usersData.get(senderID);
    if (amount > userData.money) return message.reply(getLang("not_enough_money"));

    const dice = Math.floor(Math.random() * 6) + 1;
    let winnings = dice >= 4 ? amount * 2 : -amount;
    const msg = dice >= 4 ? getLang("win", dice, formatMoney(winnings)) : getLang("lose", dice, formatMoney(amount));

    await usersData.set(senderID, { money: userData.money + winnings, data: userData.data });
    cooldowns.set(senderID, [...timestamps, now]);
    return message.reply(msg);
  }
};

function formatMoney(a) {
  if (a >= 1e9) return (a / 1e9).toFixed(2) + "𝗕";
  if (a >= 1e6) return (a / 1e6).toFixed(2) + "𝐌";
  if (a >= 1e3) return (a / 1e3).toFixed(2) + "𝗞";
  return a.toString();
}
