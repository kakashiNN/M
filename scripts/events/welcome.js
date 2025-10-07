const moment = require("moment-timezone");
const { drive } = global.utils;

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "Fixed by Ashe",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			session5: "night",
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view all commands, type: %1help",
			multiple1: "you",
			multiple2: "you guys",
			// এখানে {userNameTag} = mention tag
			defaultWelcomeMessage: `🌸 Hello {userNameTag} 🌸\nWelcome {multiple} to the chat group: {boxName}\nHave a nice {session} 💖`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe") {
			const hours = moment.tz("Asia/Dhaka").hours(); // ✅ Dhaka time
			const { threadID } = event;
			const { nickNameBot } = global.GoatBot.config;
			const prefix = global.utils.getPrefix(threadID);
			const dataAddedParticipants = event.logMessageData.addedParticipants;

			// যদি বট যোগ হয়
			if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
				if (nickNameBot)
					api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
				return message.send(getLang("welcomeMessage", prefix));
			}

			// যদি নতুন মেম্বার জয়েন করে
			if (!global.temp.welcomeEvent[threadID])
				global.temp.welcomeEvent[threadID] = {
					joinTimeout: null,
					dataAddedParticipants: []
				};

			// push new members
			global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);

			// clear old timeout
			clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

			// set new timeout
			global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
				const threadData = await threadsData.get(threadID);
				if (threadData.settings.sendWelcomeMessage == false)
					return;

				const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
				const dataBanned = threadData.data.banned_ban || [];
				const threadName = threadData.threadName;
				const userName = [],
					mentions = [];
				let multiple = false;

				if (dataAddedParticipants.length > 1)
					multiple = true;

				for (const user of dataAddedParticipants) {
					if (dataBanned.some((item) => item.id == user.userFbId))
						continue;
					userName.push(user.fullName);
					mentions.push({
						tag: user.fullName,
						id: user.userFbId
					});
				}

				if (userName.length == 0) return;

				let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

				const form = {
					mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
				};

				welcomeMessage = welcomeMessage
					.replace(/\{userName\}/g, userName.join(", "))
					.replace(/\{userNameTag\}/g, () =>
						mentions.map((m) => m.tag).join(", ")
					)
					.replace(/\{boxName\}|\{threadName\}/g, threadName)
					.replace(
						/\{multiple\}/g,
						multiple ? getLang("multiple2") : getLang("multiple1")
					)
					.replace(
						/\{session\}/g,
						hours < 12
							? getLang("session1") // সকাল
							: hours < 15
							? getLang("session2") // দুপুর
							: hours < 18
							? getLang("session3") // বিকাল
							: hours < 21
							? getLang("session4") // সন্ধ্যা
							: getLang("session5") // রাত
					);

				form.body = welcomeMessage;

				if (threadData.data.welcomeAttachment) {
					const files = threadData.data.welcomeAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}

				message.send(form);
				delete global.temp.welcomeEvent[threadID];
			}, 1500);
		}
	}
};
