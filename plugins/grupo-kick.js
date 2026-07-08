let handler = async (m, { conn, text }) => {
    if(!m.isGroup) return m.reply('Este comando solo funciona en grupos')
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : null
    if(!who) return m.reply('Etiqueta a alguien o responde a su mensaje')
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    m.reply(`Usuario eliminado del grupo`)
}
handler.command = /^(kick|echar|sacar)$/i
handler.admin = true
handler.botAdmin = true
export default handler