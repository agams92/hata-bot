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
    const from = who.findIndex(isPresent)
    const to = whom.findIndex(isPresent)
    const amount = Number(context.message.text.match(/-\d+|\d+/)[0])

    if (!(from !== -1 && to !== -1 && amount)) context.reply('Чё? Кто кому чего должен?')
    else {
        context.reply(`Такс, ${who[from]} торчит ${whom[to]} ${amount}₽? Так и запишем.`)
        api.setValue(from, to, amount)
    }
})

bot.startPolling()