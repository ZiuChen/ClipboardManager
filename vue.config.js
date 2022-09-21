const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.optimization.minimizer('uglify-plugin').use(UglifyJsPlugin, [
      {
        uglifyOptions: {
          drop_console: false,
          drop_debugger: false,
          pure_funcs: ['console.log']
        }
      }
    ])
  }
}
