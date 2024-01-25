const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, './src/main.ts'),
  output: {
    path: path.resolve(__dirname, './dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new HTMLPlugin({
      template: path.resolve(__dirname, './src/index.html')
    })
  ],
  mode: 'development'
}
