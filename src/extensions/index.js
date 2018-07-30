const glob = require('glob');
const reload = require('require-reload')(require);
const path = require('path')

// const pattern = __dirname + '/ext/' + '*.js'
// const filenames = glob.sync(pattern)
// for (let filename of filenames) {
//   module.exports[path.basename(filename,'.js')] = reload(filename)
// }
//
// const sctructures = glob.sync(__dirname+'/structures/*.js')
//
// const filesInDir = function(pattern){
//   const filenames = glob.sync(pattern)
//   for (let filename of filenames) {
//     let name = path.basename(filename,'.js')
//     require(] = reload(filename)
//   }
// }

class Extension{
  constructor(name,process){
    this.name = name
    this.process = process
  }
}
