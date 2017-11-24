const Telegraf = require('telegraf')
const { token } = require('./config')
const api = require('./api')
const util = require('util')

const who = ['Лена', 'Тёма', 'Катя', 'Андрей', 'Влад']
const whom = ['Лене', 'Тёме', 'Кате', 'Андрею', 'Владу']

const bot = new Telegraf(token)
bot.start((ctx) => {
    console.log('started:', ctx.from.id)
    return ctx.reply('Welcome!')
})

bot.hears(/сколько/i, context => {
    const isPresent = name => context.message.text.includes(name)
    const fromIndex = who.findIndex(isPresent)
    const toIndex = whom.findIndex(isPresent)

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const amount = api.getValue(fromIndex, toIndex)
        const form = fromIndex === 0 || fromIndex === 2 ? 'должна' : 'должен'
        const reply = amount !== 0 ? `${who[fromIndex]} ${form} ${whom[toIndex]} ${amount}₽.`
            : `Взятки гладки.`
        context.reply(reply)
    } else context.reply('А? Кто-то говорил о деньгах?')
})

bot.hears(/должен|должна/i, context => {
    const isPresent = name => context.message.text.includes(name)
    const fromIndex = who.findIndex(isPresent)
    const toIndex = whom.findIndex(isPresent)
    const amount = Number(context.message.text.match(/-\d+|\d+/)[0])

    if (fromIndex !== -1 && toIndex !== -1 && amount && fromIndex !== toIndex) {
        context.reply(`Такс, ${who[fromIndex]} торчит ${whom[toIndex]} ${amount}₽? Так и запишем.`)
        api.setValue(fromIndex, toIndex, amount)
    } else context.reply('Чё? Кто кому чего должен?')
})

bot.hears(/вернул|вернула/i, context => {
    const isPresent = name => context.message.text.includes(name)
    const fromIndex = who.findIndex(isPresent)
    const toIndex = whom.findIndex(isPresent)
    const form = fromIndex === 0 || fromIndex === 2 ? 'вернула' : 'вернул'
    const amount = Number(context.message.text.match(/-\d+|\d+/)[0])

    if (fromIndex !== -1 && toIndex !== -1 && amount && fromIndex !== toIndex) {
        context.reply(`Время собирать камни! ${who[fromIndex]} ${form} ${whom[toIndex]} ${amount}₽, я понял.`)
        api.setValue(fromIndex, toIndex, -amount)
    } else context.reply('Чё? Кто кому чего вернул?')
})

bot.startPolling()