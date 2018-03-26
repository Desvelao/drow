const glob = require('glob');
const reload = require('require-reload')(require);
const path = require('path')

const pattern = __dirname + '/ext/' + '*.js'
const filenames = glob.sync(pattern)
for (let filename of filenames) {
  module.exports[path.basename(filename,'.js')] = reload(filename)
}
