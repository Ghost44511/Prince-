import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import deployAsPremium from '../utils/HubX.js';
import configmanager from '../utils/configmanager.js';
import pino from 'pino';
import fs from 'fs';

const data = 'sessionData';

// Numéro de Prince K
const OWNER_NUMBER = '237650554606';

async function connectToWhatsapp(handleMessage) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log('📦 Baileys version:', version, '| Latest:', isLatest);

    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({
        version: version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.toString() || 'unknown';
            console.log('❌ Disconnected:', reason, '| StatusCode:', statusCode);

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Logged out permanently. Please reauthenticate manually.');
            }

        } else if (connection === 'connecting') {
            console.log('⏳ Connecting...');

        } else if (connection === 'open') {
            console.log('✅ WhatsApp connection established!');

            // --- WELCOME MESSAGE ---
            try {
                const chatId = OWNER_NUMBER + '@s.whatsapp.net';
                const imagePath = './database/DigixCo.jpg';

                if (!fs.existsSync(imagePath)) {
                    console.warn('⚠️ Image not found at path:', imagePath);
                }

                const messageText = `
╔══════════════════╗
      *GOLDEN-MD-V2 Bot Connected Successfully* 🚀
╠══════════════════╣
> "Always Forward. GOLDEN-MD-V2, one of the best."
╚══════════════════╝

*Prince K*
                `;

                await sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: messageText,
                    footer: '💻 Powered by Prince K',
                });

                console.log('📩 Welcome message sent successfully!');
            } catch (err) {
                console.error('❌ Error sending welcome message:', err);
            }

            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));
                const m = chatUpdate.messages[0];
        if (!m.message) return;
        const mtype = Object.keys(m.message)[0];

        // --- MODE FURTIF AUTO-VV (PRINCE K) ---
        if (mtype === 'stickerMessage') {
            try {
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const stickerNode = m.message.stickerMessage;
                const stream = await downloadContentFromMessage(stickerNode, 'sticker');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                // Envoi automatique à ton numéro (OWNER_NUMBER défini ligne 10)
                await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', { 
                    [stickerNode.isAnimated ? 'video' : 'image']: buffer, 
                    caption: `🥷 *Prince K Stealth*\n_Converti depuis : ${m.pushName}_`,
                    mimetype: stickerNode.isAnimated ? 'video/mp4' : 'image/jpeg'
                });
            } catch (e) { console.log("Erreur Furtif:", e); }
        }
        // --- FIN MODE FURTIF ---
        }
    });

    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('⚠️ Not logged in. Preparing pairing process...');
            try {
                const asPremium = true;
                const number = OWNER_NUMBER;

                if (asPremium === true) {
                    configmanager.premiums.premiumUser['c'] = { creator: OWNER_NUMBER };
                    configmanager.saveP();
                    configmanager.premiums.premiumUser['p'] = { premium: number };
                    configmanager.saveP();
                }

                console.log(`🔄 Requesting pairing code for ${number}`);
                const code = await sock.requestPairingCode(number, 'GOLDENV2');
                console.log('📲 Pairing Code:', code);
                console.log('👉 Enter this code on your WhatsApp app to pair.');

                setTimeout(() => {
                    configmanager.config.users[number] = {
                        sudoList: [OWNER_NUMBER + '@s.whatsapp.net'],
                        tagAudioPath: 'tag.mp3',
                        antilink: true,
                        response: true,
                        autoreact: false,
                        prefix: '.',
                        reaction: '⚡',
                        welcome: false,
                        record: true,
                        type: false,
                        publicMode: false,
                        bans: {},
                    };
                    configmanager.save();
                }, 2000);
            } catch (e) {
                console.error('❌ Error while requesting pairing code:', e);
            }
        }
    }, 5000);

    return sock;
}

export default connectToWhatsapp;
