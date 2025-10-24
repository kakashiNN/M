const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "2.0",
    author: "Arijit + Styled by NIROB",
    countDown: 5,
    role: 2,
    description: {
      en: "Add, remove, edit admin role"
    },
    category: "box chat",
    guide: {
      en:
        "   {pn} [add | -a] <uid | @tag>: Add admin role for user\n" +
        "   {pn} [remove | -r] <uid | @tag>: Remove admin role of user\n" +
        "   {pn} [list | -l]: List all admins"
    }
  },

  langs: {
    en: {
      added: "✔︎ 𝗔𝗱𝗱𝗲𝗱 𝗮𝗱𝗺𝗶𝗻 𝗿𝗼𝗹𝗲 𝗳𝗼𝗿 %1 𝘂𝘀𝗲𝗿𝘀:\n%2",
      alreadyAdmin: "ℹ️ %1 𝗨𝘀𝗲𝗿𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗵𝗮𝘃𝗲 𝗮𝗱𝗺𝗶𝗻 𝗿𝗼𝗹𝗲:\n%2",
      missingIdAdd: "⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗜𝗗 𝗢𝗥 𝗧𝗔𝗚 𝘂𝘀𝗲𝗿 𝘁𝗼 𝗮𝗱𝗱 𝗮𝗱𝗺𝗶𝗻 𝗿𝗼𝗹𝗲 ",
      removed: "✔︎ 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 𝗮𝗱𝗺𝗶𝗻 𝗿𝗼𝗹𝗲 𝗼𝗳  %1 𝘂𝘀𝗲𝗿𝘀:\n%2",
      notAdmin: "ℹ️ %1 𝘂𝘀𝗲𝗿𝘀 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗮𝗱𝗺𝗶𝗻 𝗿𝗼𝗹𝗲 :\n%2",
      missingIdRemove: "⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗜𝗗 𝗢𝗥 𝗧𝗔𝗚 𝘂𝘀𝗲𝗿 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲 𝗮𝗱𝗺𝗶𝗻 𝗿𝗼𝗹𝗲 ",
      listAdmin: "👔 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const fancyName = async (uid) => {
      if (!uid || uid === "0") return null;
      let name = await usersData.getName(uid) || uid;
      // Make each name fancy italic + UID small
      return `✦ 𝐍𝐚𝐦𝐞: ${name} 〘${uid}〙`;
    };

    switch (args[0]) {
      case "add":
      case "-a": {
        if (!args[1]) return message.reply(getLang("missingIdAdd"));
        let uids = [];
        if (Object.keys(event.mentions).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        const notAdminIds = [];
        const adminIds = [];
        for (const uid of uids) {
          if (config.adminBot.includes(uid)) adminIds.push(uid);
          else notAdminIds.push(uid);
        }

        config.adminBot.push(...notAdminIds);

        const addedNames = (await Promise.all(
          notAdminIds.map(uid => fancyName(uid))
        )).filter(Boolean).join("\n");

        const alreadyNames = (await Promise.all(
          adminIds.map(uid => fancyName(uid))
        )).filter(Boolean).join("\n");

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        return message.reply(
          (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, addedNames) + "\n" : "") +
          (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, alreadyNames) : "")
        );
      }

      case "remove":
      case "-r": {
        if (!args[1]) return message.reply(getLang("missingIdRemove"));
        let uids = [];
        if (Object.keys(event.mentions).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        const notAdminIds = [];
        const adminIds = [];
        for (const uid of uids) {
          if (config.adminBot.includes(uid)) adminIds.push(uid);
          else notAdminIds.push(uid);
        }

        for (const uid of adminIds) {
          const idx = config.adminBot.indexOf(uid);
          if (idx > -1) config.adminBot.splice(idx, 1);
        }

        const removedNames = (await Promise.all(
          adminIds.map(uid => fancyName(uid))
        )).filter(Boolean).join("\n");

        const notAdminNames = (await Promise.all(
          notAdminIds.map(uid => fancyName(uid))
        )).filter(Boolean).join("\n");

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        return message.reply(
          (adminIds.length > 0 ? getLang("removed", adminIds.length, removedNames) + "\n" : "") +
          (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminNames) : "")
        );
      }

      case "list":
      case "-l": {
        if (!config.adminBot.length) return message.reply("┏━━━━━━━━━━━━━┓\n   👔 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓 \n┗━━━━━━━━━━━━━┛\n(Empty)");

        let mainOwnerUID = config.mainOwner || "61572240295227"; // Add in config.json
        let admins = config.adminBot;

        let mainOwnerList = [];
        let otherAdmins = [];

        for (let uid of admins) {
          if (uid === mainOwnerUID) mainOwnerList.push(await fancyName(uid));
          else otherAdmins.push(await fancyName(uid));
        }

        let mainOwnerText = mainOwnerList.length
          ? `┏━━━━━━━━━━━━━┓\n👑 𝗠𝗔𝗜𝗡 𝗢𝗪𝗡𝗘𝗥 \n┗━━━━━━━━━━━━━┛\n${mainOwnerList.join("\n")}\n\n`
          : "";

        let adminsText = otherAdmins.length
          ? `┏━━━━━━━━━━━━━┓\n👔 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓\n┗━━━━━━━━━━━━━┛\n${otherAdmins.join("\n")}`
          : "";

        return message.reply(`${mainOwnerText}${adminsText}`);
      }
    }
  }
};
