const https = require('https');
const fs = require('fs');
const mysql = require('mysql');

const API_KEY = '8488049290:AAE3PDgW9b8616-J6y8mOXwaBoP3LjB1io0';

const idbot = 8488049290;
const umidjon = 6157195937;
const owners = [umidjon];
const user = "komron_xudoyberganov";

const DB_HOST = 'localhost';
const DB_USER = 'kinorix';
const DB_PASS = 'Kinorix';
const DB_NAME = 'x_u_15359_kinorix';

const connect = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset: 'utf8mb4'
});

connect.connect();

function bot(method, datas = {}) {
  const url = `https://api.telegram.org/bot${API_KEY}/${method}`;
  const dataString = new URLSearchParams(datas).toString();

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': dataString.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(dataString);
    req.end();
  });
}

async function getBotUsername() {
  const res = await bot('getMe');
  return res.result.username;
}

function deleteFolder(path) {
  if (fs.existsSync(path)) {
    if (fs.lstatSync(path).isDirectory()) {
      const files = fs.readdirSync(path).filter(f => f !== '.' && f !== '..');
      for (const file of files) {
        deleteFolder(`${path}/${file}`);
      }
      fs.rmdirSync(path);
      return true;
    } else if (fs.lstatSync(path).isFile()) {
      fs.unlinkSync(path);
      return true;
    }
  }
  return false;
}

function sendMessage(id, text, key = null) {
  return bot('sendMessage', {
    chat_id: id,
    text: text,
    parse_mode: 'html',
    disable_web_page_preview: true,
    reply_markup: key
  });
}

function editMessageText(cid, mid, text, key = null) {
  return bot('editMessageText', {
    chat_id: cid,
    message_id: mid,
    text: text,
    parse_mode: 'html',
    disable_web_page_preview: true,
    reply_markup: key
  });
}

function sendVideo(cid, f_id, text, key = null) {
  return bot('sendVideo', {
    chat_id: cid,
    video: f_id,
    caption: text,
    parse_mode: 'html',
    reply_markup: key
  });
}

function sendPhoto(cid, f_id, text, key = null) {
  return bot('sendPhoto', {
    chat_id: cid,
    photo: f_id,
    caption: text,
    parse_mode: 'html',
    reply_markup: key
  });
}

function copyMessage(id, from_chat_id, message_id) {
  return bot('copyMessage', {
    chat_id: id,
    from_chat_id: from_chat_id,
    message_id: message_id
  });
}

function forwardMessage(id, cid, mid) {
  return bot('forwardMessage', {
    from_chat_id: id,
    chat_id: cid,
    message_id: mid
  });
}

function deleteMessage(cid, mid) {
  return bot('deleteMessage', {
    chat_id: cid,
    message_id: mid
  });
}

function getChatMember(cid, userid) {
  return bot('getChatMember', {
    chat_id: cid,
    user_id: userid
  });
}

function replyKeyboard(key) {
  return JSON.stringify({ keyboard: key, resize_keyboard: true });
}

async function getName(id) {
  const res = await bot('getChat', { chat_id: id });
  if (res.result.first_name) {
    return res.result.first_name;
  } else {
    return res.result.title;
  }
}

function getAdmin(chat) {
  const url = `https://api.telegram.org/bot${API_KEY}/getChatAdministrators?chat_id=${chat}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ok);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => reject(e));
  });
}

async function joinchat(id) {
  const array = { inline_keyboard: [] };
  let kanallar;
  try {
    kanallar = fs.readFileSync("admin/kanal.txt", "utf8");
  } catch {
    return true;
  }
  if (!kanallar) {
    return true;
  } else {
    const ex = kanallar.split("\n");
    for (let i = 0; i < ex.length; i++) {
      const first_line = ex[i];
      let url;
      try {
        url = fs.readFileSync(`admin/links/${first_line}`, "utf8");
      } catch {
        url = '';
      }
      const ismRes = await bot('getChat', { chat_id: first_line });
      const ism = ismRes.result.title;
      const ret = await bot("getChatMember", {
        chat_id: first_line,
        user_id: id,
      });
      let stat = ret.result.status;
      if (stat) {
        if (stat === "left") {
          let get;
          try {
            get = fs.readFileSync(`admin/zayavka/${first_line}`, "utf8");
          } catch {
            get = '';
          }
          if (get.includes(id.toString())) {
            stat = "member";
          } else {
            stat = "left";
          }
        }
        if (stat === "creator" || stat === "administrator" || stat === "member") {
          if (!array.inline_keyboard[i]) array.inline_keyboard[i] = [];
          array.inline_keyboard[i][0] = { text: "✅ " + ism, url: url };
        } else {
          if (!array.inline_keyboard[i]) array.inline_keyboard[i] = [];
          array.inline_keyboard[i][0] = { text: "❌ " + ism, url: url };
        }
      }
    }
    return array;
  }
}