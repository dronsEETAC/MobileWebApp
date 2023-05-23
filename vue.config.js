const fs = require('fs')

const mosquittoCA = fs.readFileSync('./rootCA.crt');

module.exports = {
    /* devServer: {
      https: {
        key: fs.readFileSync('./localhost.key'),
        cert: fs.readFileSync('./localhost.crt'),
        ca: fs.readFileSync('./rootCA.crt'),
      }
    }, */

    /* configureWebpack: config => {
      return {
        plugins: [
          new webpack.DefinePlugin({
            'mosquittoCAfile': mosquittoCA,
          })
        ]
      }
    } */
  }