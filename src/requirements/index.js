const glob = require('glob')
const path = require('path')
const filenames = glob.sync(`${__dirname}/builtin/*.js`)

module.exports = filenames.reduce((sum, filename) => {
    sum[path.basename(filename, '.js')] = require(filename)
    return sum
},{})


