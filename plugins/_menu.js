let handler = async (m, { conn, usedPrefix, command }) => {
    let menu = `
*╭━━〔 ${namebot} 〕━━╮*
*┃* Hola @${m.sender.split('@')[0]}
*┃*
*┃* *COMANDOS DE GRUPO*
*┃* ${usedPrefix}tagall - Mencionar a todos
*┃* ${usedPrefix}kick @ - Eliminar usuario
*┃* ${usedPrefix}promote @ - Dar admin
*┃* ${usedPrefix}demote @ - Quitar admin
*┃* ${usedPrefix}welcome on/off - Bienvenida
*┃* ${usedPrefix}antilink on/off - Anti links
*╰━━━━━━━━━━━━━━━━━━╯*

Bot by ${wm}`
    conn.sendMessage(m.chat, {text: menu, mentions: [m.sender]}, {quoted: m})
}
handler.command = /^(menu|help)$/i
export default handler