
const { execSync } = require('child_process');

module.exports = {
  config: {
    name: 'upt',
    aliases: ['up', 'status', 'system', 'rtm'],
    version: '2.0',
    author: 'xnil',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot uptime and system stats',
    longDescription: 'Display bot uptime, system info, and media ban check.',
    category: 'system'
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {
    if (this.config.author !== 'xnil') {
      return message.reply("⚠ Unauthorized author change detected. Command stopped.");
    }

    const startTime = Date.now();

    // ✅ Only get users that actually exist in current threads
    const threads = await threadsData.getAll() || [];
    let uniqueUsers = new Set();

    for (const thread of threads) {
      if (thread.members) {
        thread.members.forEach(m => uniqueUsers.add(m.userID));
      }
    }

    const totalUsers = uniqueUsers.size;
    const totalGroups = threads.length;

    const uptime = process.uptime();
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    try {
      const totalMemory = (parseInt(execSync("grep MemTotal /proc/meminfo | awk '{print $2}'")) / 1024 / 1024).toFixed(2);
      const freeMemory = (parseInt(execSync("grep MemAvailable /proc/meminfo | awk '{print $2}'")) / 1024 / 1024).toFixed(2);
      const cpuModel = execSync("cat /proc/cpuinfo | grep 'model name' | uniq | awk -F: '{print $2}'").toString().trim();
      const cpuUsage = execSync("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'").toString().trim();
      const cpuCores = parseInt(execSync("nproc").toString().trim());
      const diskUsage = execSync("df -h / | tail -1 | awk '{print $5}'").toString().trim();
      const diskTotal = execSync("df -h / | tail -1 | awk '{print $2}'").toString().trim();
      const diskFree = execSync("df -h / | tail -1 | awk '{print $4}'").toString().trim();
      const linuxVersion = execSync("cat /etc/os-release | grep 'PRETTY_NAME' | cut -d= -f2").toString().trim().replace(/\"/g, '');
      const nodeVersion = process.version;

      const botPing = Date.now() - startTime;

      const mediaBan = await threadsData.get(event.threadID, 'mediaBan');
      const mediaBanStatus = mediaBan ? '🚫 Media is currently banned in this chat.' : '✅ Media is not banned in this chat.';

      const systemStats = `
💻 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 𝗣𝗔𝗡𝗘𝗟 💻
━━━━━━━━━━━━━━
👥 Users: ${totalUsers}
💬 Groups: ${totalGroups}
📶 Ping: ${botPing}ms
⚙ Commands: ${global.GoatBot?.commands?.size || "N/A"}
⏱ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s

🌐 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 🌐
━━━━━━━━━━━━━━
🖥 OS: ${linuxVersion}
📦 Node: ${nodeVersion}
⚙ CPU: ${cpuModel} (${cpuCores} cores)
🔥 Usage: ${cpuUsage}%
💾 RAM: ${freeMemory} / ${totalMemory} GB
💽 Disk: ${diskUsage} (Total: ${diskTotal}, Free: ${diskFree})

${mediaBanStatus}
━━━━━━━━━━━━━━
${uptime > 86400 ? "💪 Running strong for over a day!" : "😎 Freshly started and running smoothly!"}
`;

      const frames = [
        '🔄 Loading system info...\n[░░░░░░░░░░]',
        '🔄 Loading system info...\n[████░░░░░░]',
        '🔄 Loading system info...\n[████████░░]',
        '✅ Complete!\n[██████████]'
      ];

      let sent = await message.reply(frames[0]);
      let i = 1;
      const animate = setInterval(() => {
        if (i >= frames.length) {
          clearInterval(animate);
          api.editMessage(systemStats, sent.messageID);
        } else {
          api.editMessage(frames[i++], sent.messageID);
        }
      }, 600);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error fetching system statistics.");
    }
  }
};
