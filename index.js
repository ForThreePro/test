process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
import './config.js'
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'
import { Low, JSONFile } from 'lowdb'
import { readdirSync, watch, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pino from 'pino'
import chalk from 'chalk'
import cfonts from 'cfonts'
import readline from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Banner
cfonts.say('FenrysBot', {font: 'block', align: 'center', colors: ['cyan', 'white']})
console.log(chalk.green('Bot de Grupos 2026 - Login por Código\n'))

// Preguntar número
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

// Crear carpetas
if(!existsSync('./Sessions')) mkdirSync('./Sessions')
if(!existsSync('./plugins')) mkdirSync('./plugins')

// Base de datos
global.db = new Low(new JSONFile('./database.json'))
await global.db.read()
global.db.data = { users: {}, chats: {}, settings: {}, stats: {},...(global.db.data || {}) }

setInterval(async () => { if(global.db.data) await global.db.write() }, 30000)

const { state, saveCreds } = await useMultiFileAuthState('./Sessions')
const { version } = await fetchLatestBaileysVersion()

let phoneNumber = ''
if(!state.creds.registered) {
    phoneNumber = await question(chalk.cyan('Ingresa tu número con código país ej: 18493907272 : '))
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
}

const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}))
    },
    version,
    browser: ['FenrysBot-Grupos', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true
})

global.conn = conn

// PEDIR CODIGO DE 8 DIGITOS
if(!state.creds.registered && phoneNumber) {
    setTimeout(async () => {
        let code = await conn.requestPairingCode(phoneNumber)
        code = code?.match(/.{1,4}/g)?.join('-') || code
        console.log(chalk.yellow(`\n Tu Código: ${code}`))
        console.log(chalk.white(`1. Abre WhatsApp > Dispositivos vinculados`))
        console.log(chalk.white(`2. Toca "Vincular con número de teléfono"`))
        console.log(chalk.white(`3. Ingresa el código de arriba\n`))
    }, 3000)
}

conn.ev.on('creds.update', saveCreds)

conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if(connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode
        if(reason!== DisconnectReason.loggedOut) {
            console.log(chalk.red('Desconectado. Reconectando...'))
            process.exit(0)
        } else {
            console.log(chalk.red('Sesión cerrada. Borra la carpeta Sessions'))
        }
    }

    if(connection === 'open') {
        console.log(chalk.green('\n✅ FenrysBot-Grupos Conectado\n'))
        rl.close()
    }
})

// CARGAR PLUGINS
global.plugins = {}
const pluginFolder = join(__dirname, 'plugins')

async function loadPlugins() {
    for(let file of readdirSync(pluginFolder).filter(f => f.endsWith('.js'))) {
        try {
            global.plugins = await import(`./plugins/${file}?update=${Date.now()}`)
            console.log(chalk.cyan(`Plugin cargado: ${file}`))
        } catch(e) { console.log(chalk.red(`Error en ${file}:`), e) }
    }
}
await loadPlugins()

watch(pluginFolder, async (ev, filename) => {
    if(filename.endsWith('.js')) {
        delete global.plugins[filename]
        try {
            global.plugins[filename] = await import(`./plugins/${filename}?update=${Date.now()}`)
            console.log(chalk.green(`Plugin actualizado: ${filename}`))
        } catch(e) { console.log(chalk.red(`Error al actualizar ${filename}:`), e) }
    }
})

// CARGAR HANDLER
import('./handler.js')
console.log(chalk.yellow('Handler cargado'))