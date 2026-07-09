import { smsg } from './lib/simple.js'
import { format } from 'util'

export async function handler(chatUpdate) {
    if(!chatUpdate.messages) return
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if(!m) return
    m = smsg(global.conn, m) || m
    if(!m) return
    if(global.db.data == null) await global.db.read()

    // Crear DB si no existe
    if(!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    if(!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {welcome: true, antilink: false}

    const isGroup = m.isGroup
    const groupMetadata = isGroup? await global.conn.groupMetadata(m.chat).catch(_ => null) : {}
    const participants = isGroup? groupMetadata.participants : []
    const user = isGroup? participants.find(u => u.id === m.sender) : {}
    const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin'
    const isBotAdmin = participants.find(u => u.id === global.conn.user.id)?.admin
    const isOwner = global.owner.map(([n]) => n + '@s.whatsapp.net').includes(m.sender)

    const prefix = global.prefix.exec(m.text)?.[0] || ''
    const command = m.text.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    const args = m.text.slice(prefix.length).trim().split(' ').slice(1)

    for(let name in global.plugins) {
        let plugin = global.plugins[name].default || global.plugins[name]
        if(!plugin) continue
        if(plugin.command && plugin.command.test(command)) {
            if(plugin.group &&!isGroup) return m.reply('❌ Este comando solo funciona en grupos')
            if(plugin.admin &&!isAdmin) return m.reply('❌ Necesitas ser admin')
            if(plugin.botAdmin &&!isBotAdmin) return m.reply('❌ Necesito ser admin del grupo')
            if(plugin.owner &&!isOwner) return m.reply('❌ Solo el owner')
            try {
                await plugin.call(global.conn, m, {conn: global.conn, args, isAdmin, isBotAdmin, groupMetadata, participants})
            } catch(e) {
                console.log(e)
                m.reply(format(e))
            }
        }
    }
}

// EVENTOS DE GRUPO: Bienvenida y Despedida
global.conn.ev.on('group-participants.update', async (anu) => {
    let chat = global.db.data.chats[anu.id]
    if(!chat?.welcome) return

    for(let user of anu.participants) {
        let pp = await global.conn.profilePictureUrl(user, 'image').catch(_ => 'https://i.imgur.com/2DzfIei.png')
        let txt = ''

        // BIENVENIDA
        if(anu.action === 'add') {
            txt = global.welcome.replace('@user', `@${user.split('@')[0]}`).replace('@subject', await global.conn.getName(anu.id))
            global.conn.sendMessage(anu.id, {
                text: txt,
                mentions: [user]
            })
        }

        // DESPEDIDA
        if(anu.action === 'remove') {
            txt = global.bye.replace('@user', `@${user.split('@')[0]}`)
            global.conn.sendMessage(anu.id, {
                text: txt,
                mentions: [user]
            })
        }
    }
})

// EVENTO PRINCIPAL DE MENSAJES
global.conn.ev.on('messages.upsert', async ({messages}) => {
    if(!messages[0]) return
    await handler({messages})
})

// Guardar DB cada 30s
setInterval(async () => {
    if(global.db.data) await global.db.write()
}, 30000)