import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [['18493907272', 'Erenxzy', true]] // Pon tu número aquí
global.mods = ['18493907272']
global.prefix = /^[!./#]/ // Prefijos: . ! / #
global.namebot = 'FenrysBot-Grupos'
global.packname = 'Admin Bot'
global.wm = 'FenrysBot © 2026'

global.welcome = '👋 Bienvenido @user al grupo *@subject*'
global.bye = '👋 Se fue @user'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.greenBright("Config Actualizado"))
})