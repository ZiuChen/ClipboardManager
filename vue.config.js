const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

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
    config.plugin('copy-plugin').use(CopyPlugin, [
      {
        patterns: [
          {
            from: path.join(__dirname, 'README.md'),
            to: path.join(__dirname, 'dist', 'README.md')
          }
        ]
      }
    ])
  }
}
