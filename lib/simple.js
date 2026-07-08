export function smsg(conn, m) {
    if(!m) return m
    let M = proto.WebMessageInfo
    m.key = m.key
    m.id = m.key.id
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat.endsWith('@g.us')
    m.sender = m.fromMe? conn.user.id : m.key.participant || m.chat
    m.name = conn.getName(m.sender)
    m.text = m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    m.mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    m.quoted = null
    
    m.reply = (text, jid = m.chat) => conn.sendMessage(jid, {text, mentions: conn.parseMention(text)}, {quoted: m})
    
    return m
}

import { proto } from '@whiskeysockets/baileys'