import { makeInMemoryStore } from '@whiskeysockets/baileys'
import pino from 'pino'

const logger = pino({ level: 'fatal' })
const store = makeInMemoryStore({ logger })

store.readFromFile('./database_store.json')
setInterval(() => { store.writeToFile('./database_store.json') }, 10000)

export default store