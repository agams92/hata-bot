const Telegraf = require('telegraf')
const { token } = require('./config')
const api = require('./api')

const who = ['Лена', 'Тёма', 'Катя', 'Андрей', 'Влад']
const whom = ['Лене', 'Тёме', 'Кате', 'Андрею', 'Владу']
const bot = new Telegraf(token)
bot.start((ctx) => {
    console.log('started:', ctx.from.id)
    return ctx.reply('Welcome!')
})

bot.hears(/должен|должна/i, context => {
    const isPresent = (name) => context.message.text.includes(name)
    const fromIndex = who.findIndex(isPresent)
    const toIndex = whom.findIndex(isPresent)
    const amount = Number(context.message.text.match(/-\d+|\d+/)[0])

    if (fromIndex !== -1 && toIndex !== -1 && amount) {
        context.reply(`Такс, ${who[fromIndex]} торчит ${whom[toIndex]} ${amount}₽? Так и запишем.`)
        api.setValue(fromIndex, toIndex, amount)
    } else context.reply('Чё? Кто кому чего должен?')
})

bot.startPolling()