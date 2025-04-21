const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore
} = require('baileys');

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  let num = req.query.number;

  async function XasonPair() {
    console.log('>> Pairing attempt started...');
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    try {
      let XasonSocket = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
        },
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
      });

      XasonSocket.ev.on('creds.update', saveCreds);

      if (!XasonSocket.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        console.log('Number:', num);

        const code = await XasonSocket.requestPairingCode(num);
        console.log('Pairing Code:', code);

        if (!res.headersSent) {
          return res.send({ code });
        }
      } else {
        console.log('Already registered. Deleting session...');
        await removeFile('./session');
        return await XasonPair(); // Try again with fresh session
      }

      XasonSocket.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === 'open') {
          await delay(10000);

          const sessionData = fs.readFileSync('./session/creds.json');
          const audio = fs.readFileSync('./kongga.mp3');

          const success = await XasonSocket.sendMessage(XasonSocket.user.id, {
            audio: audio,
            mimetype: 'audio/mp4',
            ptt: true
          });

          await XasonSocket.sendMessage(XasonSocket.user.id, {
            text: `✅ *SUCCESSFULLY CONNECTED!*\n\n*POWERED BY MANASSEH*`,
            quoted: success
          });

          await delay(100);
          await removeFile('./session');
          process.exit(0);
        } else if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
          return await XasonPair();
        }
      });

    } catch (err) {
      console.error('❌ ERROR:', err);
      await removeFile('./session');

      if (!res.headersSent) {
        return res.send({ code: 'Service Unavailable' });
      }
    }
  }

  return await XasonPair();
});

process.on('uncaughtException', function (err) {
  let e = String(err);
  if (e.includes("conflict")) return;
  if (e.includes("Socket connection timeout")) return;
  if (e.includes("not-authorized")) return;
  if (e.includes("rate-overlimit")) return;
  if (e.includes("Connection Closed")) return;
  if (e.includes("Timed Out")) return;
  if (e.includes("value not found")) return;
  console.log("Caught exception:", err);
});

module.exports = router;
