const cooldowns = new Map();

module.exports = {
  config: {
    name: "coin",
    version: "3.0",
    author: "NIROB",
    countDown: 10,
    shortDescription: { en: "🪙 Flip a coin and test your luck!" },
    longDescription: { en: "Choose heads or tails and see if luck is on your side 💫" },
    category: "game"
  },

  langs: {
    en: {
      invalid: "⚠️ 𝗨𝘀𝗮𝗴𝗲: /𝗰𝗼𝗶𝗻 <𝗮𝗺𝗼𝘂𝗻𝘁> <𝗵𝗲𝗮𝗱/𝘁𝗮𝗶𝗹>",
      not_money: "💸 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 😿",
      win: "🪙 𝐂𝐨𝐢𝐧 𝐟𝐥𝐢𝐩𝐩𝐞𝐝 → **%1**\n🎉 𝐘𝐨𝐮 𝐰𝐨𝐧 **$%2** 💰",
      lose: "🪙 𝐂𝐨𝐢𝐧 𝐟𝐥𝐢𝐩𝐩𝐞𝐝 → **%1**\n💔 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 **$%1** 😿"
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    if (args.length < 2) return message.reply(getLang("invalid"));
    const amount = parseInt(args[0]);
    const choice = args[1].toLowerCase();
    if (!["head", "tail", "heads", "tails"].includes(choice)) return message.reply(getLang("invalid"));
    if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid"));

    const userData = await usersData.get(senderID);
    if (amount > userData.money) return message.reply(getLang("not_money"));

    const side = Math.random() < 0.5 ? "head" : "tail";
    const won = side.startsWith(choice.slice(0, 1));
    const winAmount = won ? amount * 2 : -amount;
    const msg = won ? getLang("win", side, formatMoney(winAmount)) : getLang("lose", side, formatMoney(amount));

    await usersData.set(senderID, { money: userData.money + winAmount, data: userData.data });
    return message.reply(msg);
  }
};

function formatMoney(a) {
  if (a >= 1e9) return (a / 1e9).toFixed(2) + "𝗕";
  if (a >= 1e6) return (a / 1e6).toFixed(2) + "𝐌";
  if (a >= 1e3) return (a / 1e3).toFixed(2) + "𝗞";
  return a.toString();
  }
