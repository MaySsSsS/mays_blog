/**
 * Steam 数据获取脚本
 * 用于 GitHub Actions 定时获取 Steam 游戏数据并上传到 Cloudflare R2
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Steam 配置 - 从环境变量读取
const STEAM_API_KEY = process.env.STEAM_API_KEY || "";
const STEAM_ID = process.env.STEAM_ID || "76561198378879040";

// Cloudflare R2 配置
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = "my-games";

const API_BASE = "https://api.steampowered.com";

// 简单的 AWS S3 签名 v4 实现（用于 R2）
async function uploadToR2(data, key) {
  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";
  const method = "PUT";
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const contentType = "application/json";
  const body = JSON.stringify(data, null, 2);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  // 创建规范请求
  const canonicalUri = `/${R2_BUCKET_NAME}/${key}`;
  const canonicalQueryString = "";
  const payloadHash = await sha256Hex(body);
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // 创建待签名字符串
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256Hex(
    canonicalRequest
  )}`;

  // 计算签名
  const signingKey = await getSignatureKey(
    R2_SECRET_ACCESS_KEY,
    dateStamp,
    region,
    service
  );
  const signature = await hmacHex(signingKey, stringToSign);

  // 创建授权头
  const authorizationHeader = `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // 发送请求
  const response = await fetch(`${endpoint}${canonicalUri}`, {
    method,
    headers: {
      "Content-Type": contentType,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorizationHeader,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`R2 upload failed: ${response.status} - ${text}`);
  }

  return true;
}

// SHA256 哈希
async function sha256Hex(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// HMAC-SHA256
async function hmac(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? new TextEncoder().encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message)
  );
}

async function hmacHex(key, message) {
  const sig = await hmac(key, message);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 获取签名密钥
async function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = await hmac("AWS4" + secretKey, dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  return kSigning;
}

async function fetchPlayerSummary() {
  const url = `${API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.response.players[0] || null;
}

async function fetchOwnedGames() {
  const url = `${API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true`;
  const response = await fetch(url);
  const data = await response.json();
  return data.response.games || [];
}

async function fetchRecentlyPlayedGames() {
  const url = `${API_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&count=10`;
  const response = await fetch(url);
  const data = await response.json();
  return data.response.games || [];
}

async function main() {
  console.log("🎮 开始获取 Steam 数据...");

  if (!STEAM_API_KEY || !STEAM_ID) {
    console.error("❌ 错误: 请设置 STEAM_API_KEY 和 STEAM_ID 环境变量");
    process.exit(1);
  }

  try {
    // 获取玩家信息
    console.log("📝 获取玩家信息...");
    const player = await fetchPlayerSummary();

    // 获取拥有的游戏
    console.log("🎯 获取游戏库...");
    const games = await fetchOwnedGames();

    // 获取最近游玩的游戏（用于补充 playtime_2weeks 数据）
    console.log("🕐 获取最近游玩...");
    const recentGames = await fetchRecentlyPlayedGames();

    // 合并最近游玩数据
    const recentGamesMap = new Map(recentGames.map((g) => [g.appid, g]));
    const mergedGames = games.map((game) => {
      const recent = recentGamesMap.get(game.appid);
      return {
        ...game,
        playtime_2weeks: recent?.playtime_2weeks || 0,
      };
    });

    // 构建输出数据
    const outputData = {
      lastUpdated: new Date().toISOString(),
      player: player,
      games: mergedGames,
    };

    // 上传到 Cloudflare R2
    if (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
      console.log("☁️ 上传到 Cloudflare R2...");
      await uploadToR2(outputData, "steam-games.json");
      console.log("✅ R2 上传成功!");
    }

    // 同时保存本地文件（用于开发和备份）
    const outputPath = path.join(__dirname, "../public/data/steam-games.json");
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log(`✅ 成功! 共获取 ${games.length} 款游戏`);
    console.log(`📁 数据已保存到: ${outputPath}`);

    // 输出统计信息
    const totalPlaytime = games.reduce(
      (sum, g) => sum + (g.playtime_forever || 0),
      0
    );
    const playedGames = games.filter((g) => g.playtime_forever > 0).length;
    console.log(
      `📊 统计: ${playedGames} 款已游玩, 总时长 ${Math.floor(
        totalPlaytime / 60
      )} 小时`
    );
  } catch (error) {
    console.error("❌ 获取数据失败:", error.message);
    process.exit(1);
  }
}

main();
