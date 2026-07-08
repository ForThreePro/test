let handler = async (m, { conn, text }) => {
    if(!m.isGroup) return m.reply('Este comando solo funciona en grupos')
    let members = (await conn.groupMetadata(m.chat)).participants.map(v => v.id)
    let mensaje = text? text : '📢 ATENCIÓN A TODOS'
    
    conn.sendMessage(m.chat, { 
        text: `*${mensaje}*\n\n` + members.map(v => `• @${v.split('@')[0]}`).join('\n'),
        mentions: members 
    }, { quoted: m })
}
handler.command = /^(tagall|todos|invocar)$/i
handler.admin = true
export default handler