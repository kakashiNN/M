const fs = require("fs");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
    name: "autosend",
    version: "3.2",
    role: 0,
    author: "MAHABUB RAHMAN + NIROB", 
    description: "Automatically sends ONE video per time slot from local JSON in Butterfly style",
    category: "Media",
    usages: "No manual trigger needed",
    cooldowns: 5,
    style: "butterfly" // শুধু Butterfly style
};

const lastSent = {};
const errorSent = {}; // ❌ Failed message flag

function getRandomVideo() {
    const filePath = __dirname + "/nirob.json"; 
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);

    return data[Math.floor(Math.random() * data.length)];
}

// 🦋 Butterfly Style Message Formatter
function formatMessage(time, title, note) {
    return `𓆩🦋𓆪 ･ﾟ✧ 𝗔ᴜᴛᴏꜱᴇɴᴅ ✧ﾟ･ 𓆩🦋𓆪
━━━━━━━━━━━━━━━━━━
🕒 𝐓𝐢𝐦𝐞 𝐧𝐨𝐰 : ${time}

🪶: ${title}
💬: ${note}

✿ ✦ 🤖 Ａｕｔｏｍａｔｉｃ - Ｍｅｓｓａｇｅ ✦ ✿`;
}

async function sendVideo(api, threadID, timeSlot) {
    try {
        // একটাই র্যান্ডম ভিডিও
        const videoData = getRandomVideo();

        if (!videoData || !videoData.video) {
            if (!errorSent[threadID]) { // শুধু একবার পাঠাবে
                api.sendMessage("❌ Failed to fetch video from JSON.", threadID);
                errorSent[threadID] = true;
            }
            return;
        }

        // ভিডিও ঠিক থাকলে ❌ flag reset হবে
        if (errorSent[threadID]) errorSent[threadID] = false;

        const res = await axios.get(videoData.video, { responseType: "stream" });

        const messageBody = formatMessage(timeSlot, videoData.title, videoData.note);

        api.sendMessage({
            body: messageBody,
            attachment: res.data
        }, threadID);

        // লাস্ট সেন্ট টাইমস্লট আপডেট
        lastSent[threadID] = timeSlot;

    } catch (error) {
        console.error("🚨 JSON/Drive Error:", error);
        if (!errorSent[threadID]) { // শুধুমাত্র একবার পাঠাবে
            api.sendMessage("❌ Failed to fetch video from JSON.", threadID);
            errorSent[threadID] = true;
        }
    }
}

function scheduleVideo(api) {
    const timeSlots = [
        "1:30AM","2:30AM","3:30AM","4:30AM","5:30AM","6:30AM",
        "7:30AM","8:30AM","9:30AM","10:30AM","11:30AM","12:30PM",
        "1:30PM","2:30PM","3:30PM","4:30PM","5:30PM","6:30PM",
        "7:30PM","8:30PM","9:30PM","10:30PM","11:30PM","12:30AM"
    ];

    setInterval(async () => {
        const currentTime = moment().tz("Asia/Dhaka").format("h:mmA");
        const threads = await api.getThreadList(100, null, ["INBOX"]);

        for (const thread of threads) {
            if (!thread.isGroup) continue;

            const threadID = thread.threadID;
            // ✅ একবারে শুধু একটি ভিডিও পাঠাবে
            if (timeSlots.includes(currentTime) && lastSent[threadID] !== currentTime) {
                await sendVideo(api, threadID, currentTime);
            }
        }
    }, 30000);
}

module.exports.onLoad = function ({ api }) {
    if (global.autosendInitialized) return;
    global.autosendInitialized = true;

    scheduleVideo(api);
    console.log("📌 AutoSend Started with Butterfly Style + 1 video per time slot");
};

module.exports.onStart = () => {};
