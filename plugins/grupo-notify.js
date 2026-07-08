let handler = async (m, { conn, text }) => {
    if(!m.isGroup) return m.reply('Solo grupos')
    if(!text) return m.reply('Pon un mensaje. Ej: .notify Se actualizó el grupo')
    
    let members = (await conn.groupMetadata(m.chat)).participants.map(v => v.id)
    
    let noti = `*🚨 NOTIFICACIÓN IMPORTANTE 🚨*\n\n`
    noti += `${text}\n\n`
    noti += `*Enviado por:* @${m.sender.split('@')[0]}`
    
    conn.sendMessage(m.chat, { 
        text: noti,
        mentions: [m.sender, ...members]
    }, { quoted: m })
}
handler.command = /^(notify|aviso|notificar)$/i
handler.admin = true
export default handler