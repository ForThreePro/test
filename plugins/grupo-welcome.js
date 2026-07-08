let handler = async (m, { conn, args, isAdmin }) => {
    if(!m.isGroup) return
    if(!isAdmin) return m.reply('Solo admins')

    let type = args[0]
    let on = /^(on|1|true)$/i.test(args[1])

    db.data.chats[m.chat] = db.data.chats[m.chat] || {}

    if(type === 'welcome'){
        db.data.chats[m.chat].welcome = on
        m.reply(`Bienvenida ${on? 'activada' : 'desactivada'}`)
    }
    if(type === 'antilink'){
        db.data.chats[m.chat].antilink = on
        m.reply(`Antilink ${on? 'activado' : 'desactivado'}`)
    }
}
handler.command = /^(welcome|antilink)$/i

// ANTI LINK Y BIENVENIDA
handler.all = async function(m) {
    let chat = db.data.chats[m.chat] || {}

    // BIENVENIDA
    if(chat.welcome && m.messageStubType === 27){
        let user = m.messageStubParameters[0]
        let subject = await conn.getName(m.chat)
        let text = welcome.replace('@user', `@${user.split('@')[0]}`).replace('@subject', subject)
        conn.sendMessage(m.chat, {text, mentions: [user]})
    }

    // ANTILINK
    if(chat.antilink && m.text && m.text.match(/chat.whatsapp.com/g) &&!isAdmin){
        let gclink = await conn.groupInviteCode(m.chat)
        if(!m.text.includes(gclink)){
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            m.reply(`Link detectado. Usuario eliminado`)
        }
    }
}

export default handler