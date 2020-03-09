const fs = require('fs')
const path = require('path')
const request = require('request')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const Memory = require('lowdb/adapters/Memory')
const is = require('./is')
const chalk = require('chalk')

const example = {
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
  comments: [{ id: 1, body: 'some comment', postId: 1 }],
  profile: { name: 'typicode' }
}

module.exports = function(source) {
  return new Promise((resolve, reject) => {
    if (is.FILE(source)) {
      if (!fs.existsSync(source)) {
        console.log(chalk.yellow(`  Oops, ${source} doesn't seem to exist`))
        console.log(chalk.yellow(`  Creating ${source} with some default data`))
        console.log()
        fs.writeFileSync(source, JSON.stringify(example, null, 2))
      }

      resolve(low(new FileAsync(source)))
    } else if (is.URL(source)) {
      // Load remote data
      const opts = {
        url: source,
        json: true
      }

      request(opts, (err, response) => {
        if (err) return reject(err)
        resolve(low(new Memory()).setState(response.body))
      })
    } else if (is.MODULE(path.resolve(source))) {
      // Clear cache
      const filename = path.resolve(source)
      delete require.cache[filename]
      let data = require(filename)

      if (typeof data === 'function') {
        data = data()
      } else if (data && typeof data.default === 'function') {
        data = data.default()
      } else if (data && typeof data.default === 'object') {
        data = data.default
      }

      if (typeof data !== 'object') {
        throw new Error('The database is a JavaScript file but the export is not a function nor an object.')
      }

      resolve(low(new Memory()).setState(data))
    } else {
      throw new Error(`Unsupported source ${source}`)
    }
  })
}
