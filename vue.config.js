const fs = require('fs')

const mosquittoCA = fs.readFileSync('./rootCA.crt');

module.exports = {
    devServer: {
      https: {
        key: fs.readFileSync('../mobileAppCertificates/localhostIP.key'),
        cert: fs.readFileSync('./localhostIP.crt'),
        ca: fs.readFileSync('./rootCA.crt'),
      }
    },

    /*  chainWebpack: config => {
      config.plugin("define").tap(args => {
        let _base = args[0]["process.env"];
        args[0]["process.env"] = {
          ..._base,
          "rootCA": mosquittoCA,
        };
        return args;
      });
    }  */

  }



  

     