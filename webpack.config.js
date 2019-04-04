const path = require('path');

module.exports = {
  entry: ['./public/src/app.js'],
  output: {
      filename: 'bundle.js',
      publicPath: '/public/',
      path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread']
            }
          },
          {
            loader: 'eslint-loader',
            options: {
              emitWarning: true
            }
          }
        ]
      },
      {
         test: /\.scss$/,
         loaders: [ 'style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  devServer: {
    watchContentBase: true,
    inline: true,
    port: 8080,
    progress: true,
  }
};
