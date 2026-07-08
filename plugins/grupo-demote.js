let handler = async (m, { conn }) => {
    if(!m.isGroup) return m.reply('Solo grupos')
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : null
    if(!who) return m.reply('Etiqueta a alguien')
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    m.reply(`@${who.split('@')[0]} ya no es admin`, null, {mentions: [who]})
}
handler.command = /^(demote|quitaradmin)$/i
handler.admin = true
handler.botAdmin = true
export default handler