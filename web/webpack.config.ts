import merge from "webpack-merge";
import common from "./webpack.common";

// Plugins
const args = require('minimist')(process.argv);
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin} = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Configs
const ENABLE_Analyze: boolean = args['analyze'];

module.exports = merge(common, {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  optimization: {
    minimizer: [
      // 使用 cssnano 优化
      new OptimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          discardComments: { removeAll: true },
          // zindex 不优化
          zindex: {
            disabled: true,
          },
        },
        canPrint: true,
      }),
      // 压缩 js
      new TerserPlugin({
        test: /\.js$/i,
        cache: true,
        parallel: true,
        terserOptions: {
          warnings: false,
          compress: {
            drop_console: true,
          },
          output: {
            beautify: false,
            comments: false,
          },
        },
        sourceMap: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      name: 'vendors',
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
  plugins: [
    // 移除 dist 目录
    new CleanWebpackPlugin(),
    // 图形化分析工具
    ...(ENABLE_Analyze ? [new BundleAnalyzerPlugin()] : []),
  ],
});
