const Telegraf = require('telegraf')
const { token, ids } = require('./config')
const api = require('./api')
const intersection = require('lodash.intersection')

const who = ['Лена', 'Тёма', 'Катя', 'Андрей', 'Влад']
const whom = ['Лене', 'Тёме', 'Кате', 'Андрею', 'Владу']

const bot = new Telegraf(token)

bot.context.parseMessage = {
    getData: context => {
        const text = context.message.text
        const words = text
            .replace(/[.,?\/#!$%^&*;:{}=\-_`~()]/g,"")
            .replace(/\s{2,}/g," ")
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
    },
    getWordForm: (word, index) => {
        const feminitive = index === 0 || index === 2
        switch (word) {
            case 'должен':
                return feminitive ? 'должна' : 'должен'
            case 'вернул':
                return feminitive ? 'вернула' : 'вернул'
            case 'отдал':
                return feminitive ? 'отдал' : 'отдала'
        }
    }
}

bot.context.listen = (phrase, context, callback) => {
    if (context.message.text) {
        switch (typeof phrase) {
            case 'string':
                if (context.message.text.trim().toLowerCase().split(' ').includes(phrase)) {
                    return callback(context)
                }
                break
            case 'object':
                const intersectionArray = intersection(context.message.text.trim().toLowerCase().split(' '), phrase)
                if (intersectionArray.length > 0) {
                    return callback(context)
                }
                break
        }
    }
}

bot.context.howMuchHandler = context => {
    const { fromIndex, toIndex } = context.parseMessage.getData(context)

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const amount = api.getValue(fromIndex, toIndex)
        const form = context.parseMessage.getWordForm('должен', fromIndex)
        const reply = amount !== 0 ? `${who[fromIndex]} ${form} ${whom[toIndex]} ${amount}₽.`
            : `Взятки гладки.`
        context.reply(reply)
    }
}

bot.context.borrowHandler = context => {
    const { fromIndex, toIndex, amount } = context.parseMessage.getData(context)

    if (fromIndex !== -1 && toIndex !== -1 && amount && fromIndex !== toIndex) {
        context.reply(`Такс, ${who[fromIndex]} торчит ${whom[toIndex]} ${amount}₽? Так и запишем.`)
        api.setValue(fromIndex, toIndex, amount)
    }
}

bot.context.repayHandler = context => {
    const { fromIndex, toIndex, amount } = context.parseMessage.getData(context)
    const form = context.parseMessage.getWordForm('вернул', fromIndex)

    if (fromIndex !== -1 && toIndex !== -1 && amount && fromIndex !== toIndex) {
        context.reply(`Время собирать камни! ${who[fromIndex]} ${form} ${whom[toIndex]} ${amount}₽.`)
        api.setValue(fromIndex, toIndex, -amount)
    }
}

bot.on('message', context => {
    context.listen('сколько', context, bot.context.howMuchHandler)
    context.listen(['должна', 'должен'], context, bot.context.borrowHandler)
    context.listen(['вернул', 'вернула', 'отдал', 'отдала'], context, bot.context.repayHandler)
})

bot.startPolling()