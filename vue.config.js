// vue.config.js
const path = require('path');
module.exports = {
  lintOnSave: false,
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        vueConfig: path.resolve(__dirname, 'vueConfig.js')
      }
    }
  }
};
