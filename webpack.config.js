const path = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin")
const { merge } = require('webpack-merge');
const webpack = require('webpack')
//Development plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// Production plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
    entry: './src/client/C3PO.js',
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.min.js',
        libraryTarget: 'var',
        library: 'Client'
    },
    module: {
        rules: [
            {
                test: '/\.js$/',
                exclude: /node_modules/,
                loader: "babel-loader",  
                options: {
                    presets: ['@babel/preset-env']
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                exclude: /node_modules/,
                loader: "file-loader",
                options: {
                  name: '[path][name].[ext]',
                }
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/client/views/index.html",
            filename: "./index.html",
        })
    ]
};
 
const productionConfig = {
    mode: 'production',
    optimization: {
        minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: '[name].css'}),
        // TODO update when in production
        new webpack.DefinePlugin(
            {
                'process.env.HOST': JSON.stringify('http://localhost'),
                'process.env.PORT': JSON.stringify('8089')
            }
            )
    ]
 };
 
const developmentConfig = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader' ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            // Simulate the removal of files
            dry: true,
            // Write Logs to Console
            verbose: true,
            // Automatically remove all unused webpack assets on rebuild
            cleanStaleWebpackAssets: true,
            protectWebpackAssets: false
        }),
        new webpack.DefinePlugin(
            {
                'process.env.HOST': JSON.stringify('http://localhost'),
                'process.env.PORT': JSON.stringify('8089')
            }
            )
    ]
};

 
 
module.exports = env => {
    let conf={}
    console.log(env.mode)
    switch(env.mode) {
    case 'development':
      conf =  merge(commonConfig, developmentConfig);
      break;
    case 'production':
      conf =  merge(commonConfig, productionConfig);
      break;
    default:
      throw new Error('No matching configuration was found for environment '+env+'!');
  }
  console.log(":::: Webpack configuration used :::")
  console.log(conf)
  return conf
}