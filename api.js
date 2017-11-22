const fs = require('fs')

class Matrix {
    constructor(amount = 5) {
        this.amount = amount
        this.path = './'
        this.filename = 'matrix.js'
        this.setValue = this.setValue.bind(this)

        this.init()
    }

    doesMatrixExist() {
        if (fs.existsSync(`${this.path}${this.filename}`)) {
            console.log('File exists')
            return true
        } else {
            console.log('File doesn\'t exist')
            return false
        }
    }

    createMatrix() {
        const matrix = []
        for (let i = 0; i < this.amount ** 2; i++) {
            matrix.push(0)
        }
        this.matrix = matrix
        this.saveMatrix()
    }

    saveMatrix() {
        const self = this
        fs.writeFile(`${self.path}${self.filename}`, JSON.stringify(self.matrix), function(error) {
            if (error) {
                console.log('Error while writing to file: ', error)
            } else {
                console.log(`Saved to ${self.path}${self.filename}`)
            }
        })
    }

    readMatrix() {
        const self = this
        fs.readFile(`${self.path}${self.filename}`, function(error, data) {
            if (error) {
                console.log('Error while reading file:', error)
            } else {
                self.matrix = JSON.parse(data)
                console.log('Successfully read file')
            }
        })
    }

    setValue(whoIndex, whomIndex, amount) {
        console.log(whoIndex, whomIndex, amount)
        const index = whoIndex * 5 + whomIndex
        this.matrix[index] = this.matrix[index] + amount
        this.saveMatrix()
    }

    init() {
        this.doesMatrixExist() ? this.readMatrix() : this.createMatrix()
    }
}

const matrix = new Matrix
module.exports.setValue = matrix.setValue

/*
        'Лене' 'Тёме' 'Кате' 'Андрею' 'Владу'

'Лена'    0       0      0       0       0

'Тёма'    0       0      0       0       0

'Катя'    0       0      0       0       0

'Андрей'  0       0      0       0       0

'Влад'    0       0      0       0       0

*/