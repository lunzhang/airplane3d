var path = require('path');

module.exports=[{
  entry:{
    'app':'./public/src/app.js'
  },
  output:{
      filename : 'bundle.js',
      path: path.resolve(__dirname,'/publicbuild'),
      publicPath: '/public/build/'
  },
  module:{
    loaders:[
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file-loader'
      },
      {
         test: /\.css$/,
         loader: "style-loader!css-loader"
      },
      {
         test: /\.scss$/,
         loaders: [ 'style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
}];
