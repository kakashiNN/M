const os = require("os");

const startTime = Date.now();

module.exports = {
  config: {
    name: "up2",
    aliases: ["uptime2", "systeminfo"],
    version: "1.2",
    author: "NIROB + ChatGPT Fixed",
    countDown: 5,
    role: 0,
    category: "system",
    shortDescription: "Show bot uptime & system info",
    longDescription: "Get uptime, RAM, CPU, users/groups count & ping (no media)",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const pingStart = Date.now();
      const tempMsg = await api.sendMessage("⏳ Fetching system info...", event.threadID);

      // Uptime Calculation
      const uptimeInMs = Date.now() - startTime;
      const totalSeconds = Math.floor(uptimeInMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // System Info
      const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMemGB = (totalMemGB - freeMemGB).toFixed(2);
      const botRamMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
      const cpuModel = os.cpus()[0]?.model || "Unknown CPU";
      const cpuCores = os.cpus().length;
      const osType = `${os.type()} ${os.arch()}`;
      const nodeVersion = process.version;

      // BD Time
      const now = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });

      // Database (Filtered)
      const allUsersRaw = await usersData.getAll();
      const allThreadsRaw = await threadsData.getAll();

      // Filter valid users & threads
      const validUsers = allUsersRaw.filter(u => u && u.userID);
      const validThreads = allThreadsRaw.filter(t => t && t.threadID);

      // Only groups count
      const groupThreads = validThreads.filter(t => t.threadInfo?.threadType === "group");

      const ping = Date.now() - pingStart;

      // Final Message
      const info = `
🔧 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 🔧
────────────────────────
🕒 Uptime: ${uptime}
📅 Time: ${now}
📡 Ping: ${ping}ms

💻 CPU: ${cpuModel}
🧩 Cores: ${cpuCores}
💾 Memory: ${usedMemGB} / ${totalMemGB} GB
📊 Bot RAM: ${botRamMB} MB
🧠 OS: ${osType}
⚙️ Node.js: ${nodeVersion}

👥 Users: ${validUsers.length}
💬 Groups: ${groupThreads.length}
────────────────────────
✅ Status: Running smoothly 🚀
`;

      await api.editMessage(info, tempMsg.messageID);

    } catch (err) {
      console.error("❌ up2.js error:", err);
      return api.sendMessage("⚠️ Error while fetching system info.", event.threadID);
    }
  }
};
