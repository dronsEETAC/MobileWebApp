const fs = require('fs')
module.exports = {
    devServer: {
      https: {
        key: fs.readFileSync('./localhost.key'),
        cert: fs.readFileSync('./localhost.crt'),
        ca: fs.readFileSync('./rootCA.crt'),
      }
    },
  };