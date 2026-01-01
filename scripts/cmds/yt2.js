const axios = require("axios");
const fs = require('fs');

const apiUrl = "https://nirob-ytdl-apis.vercel.app/api/ytdl?url=";

module.exports = {
    config: {
        name: "yt",
        version: "1.2.0",
        aliases: ['youtube'],
        author: "nirob",
        countDown: 5,
        role: 0,
        description: {
            en: "Download video, audio, and info from YouTube using Nirob API"
        },
        category: "media",
        guide: {
            en: "Usage:\n" +
                "  {pn} -v <video link>: download video\n" +
                "  {pn} -a <video link>: download audio\n" +
                "  {pn} -i <video link>: get video info\n" +
                "Example:\n" +
                "  {pn} -v https://youtube.com/shorts/XXXX\n" +
                "  {pn} -a https://youtube.com/watch?v=XXXX\n" +
                "  {pn} -i https://youtube.com/watch?v=XXXX"
        }
    },

    onStart: async ({ api, args, event, commandName }) => {
        if (!args[0] || !args[1]) {
            return api.sendMessage('❌ Please provide an action and a YouTube URL.', event.threadID, event.messageID);
        }

        const action = args[0].toLowerCase();
        const videoUrl = args[1];

        try {
            const { data } = await axios.get(`${apiUrl}${encodeURIComponent(videoUrl)}`);

            // Video / Audio download
            if (['-v', 'video', 'mp4', '-a', 'audio', 'mp3'].includes(action)) {
                const format = ['-a', 'audio', 'mp3'].includes(action) ? 'mp3' : 'mp4';
                const downloadLink = format === 'mp4' ? data.video : data.audio;
                const path = `ytb_${format}_${data.id}.${format}`;

                await api.sendMessage({
                    body: `• Title: ${data.title}\n• Duration: ${data.duration} sec\n• Quality: ${data.quality || 'N/A'}`,
                    attachment: await downloadFile(downloadLink, path)
                }, event.threadID, () => fs.unlinkSync(path), event.messageID);
            }

            // Video info
            else if (['-i', 'info'].includes(action)) {
                await api.sendMessage({
                    body: 
`✨ Title: ${data.title}
⏳ Duration: ${data.duration} sec
👀 Views: ${data.views || 'N/A'}
👍 Likes: ${data.likes || 'N/A'}
📤 Channel: ${data.channel || 'N/A'}
🔗 Video URL: ${videoUrl}`,
                    attachment: await downloadStream(data.thumbnail, 'thumb.jpg')
                }, event.threadID, event.messageID);
            }

            else {
                return api.sendMessage('❌ Invalid action. Use -v, -a, or -i.', event.threadID, event.messageID);
            }

        } catch (err) {
            console.error(err);
            return api.sendMessage('❌ Failed to process the YouTube URL. ' + err.message, event.threadID, event.messageID);
        }
    }
};

// Functions to download files
async function downloadFile(url, pathName) {
    const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
}

async function downloadStream(url, pathName) {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
}
