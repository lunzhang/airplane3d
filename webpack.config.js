const three = require('three');

module.exports = {
  entry: {
   bundle: './public/src/app.js',
   three: './public/src/three.js'
  },
  output:{
      filename: '[name].js',
      path: `${__dirname}/public/build/`,
  },
  module:{
    loaders:[
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
         test: /\.scss$/,
         loaders: [ 'style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
};
