const fs = require('fs')

const mosquittoCA = fs.readFileSync('./rootCA.crt');

module.exports = {
    /* devServer: {
      https: {
        key: fs.readFileSync('./localhost.key'),
        cert: fs.readFileSync('./localhost.crt'),
        ca: fs.readFileSync('./rootCA.crt'),
      }
    },

    chainWebpack: config => {
      config.plugin("define").tap(args => {
        let _base = args[0]["process.env"];
        args[0]["process.env"] = {
          ..._base,
          "rootCA": mosquittoCA,
        };
        return args;
      });
    } */

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