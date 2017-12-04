const Telegraf = require('telegraf')
const { token, ids, who, whom } = require('./config')
const api = require('./api')
const intersection = require('lodash.intersection')

const bot = new Telegraf(token)

bot.context.parseMessage = {
    getData: context => {
        const text = context.message.text
        const words = text
            .replace(/[.,?\/#!$%^&*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .toLowerCase()
            .split(' ')
        const isPresent = name => words.includes(name.toLowerCase())
        let fromIndex = who.findIndex(isPresent)
        let toIndex = whom.findIndex(isPresent)
        const amount = text.match(/-\d+|\d+/) && Number(text.match(/-\d+|\d+/)[0])
        if (fromIndex === -1 && words.includes('я')) {
            fromIndex = ids.indexOf(context.from.id)
        }
        if (toIndex === -1 && words.includes('мне')) {
            toIndex = ids.indexOf(context.from.id)
        }
        return { fromIndex, toIndex, amount }
    }
}

bot.hears(/сколько|скок/i, context => {
    const { fromIndex, toIndex } = context.parseMessage.getData(context)
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
    const amount = api.getValue(fromIndex, toIndex)
    const reply = amount !== 0 ? `${who[fromIndex]} торчит ${whom[toIndex]} ${amount}₽.`
        : `Взятки гладки.`
    context.reply(reply)
})

bot.hears(/должен|должна|вернул|вернула|отдал|отдала/i, context => {
    const matchedWord = context.match[0].toLowerCase()
    const debt = /должен|должна/.test(matchedWord)
    let { fromIndex, toIndex, amount } = context.parseMessage.getData(context)
    if (fromIndex === -1 || toIndex === -1 || !amount || fromIndex === toIndex) return

    context.reply(`${who[fromIndex]} ${matchedWord} ${whom[toIndex]} ${amount}₽.`)
    // если кто-то занял, то плюсуем долг
    // если кто-то вернул, то вычитаем
    amount = debt ? amount : -amount
    api.setValue(fromIndex, toIndex, amount)
})

bot.hears(/чоч тама/i, context => context.reply('а чоа ващее тооо'))
bot.hears(/алис/i, context => context.reply('что тебе нужно от меня, ебанько, блядь'))

bot.startPolling()