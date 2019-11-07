import { resolve } from 'path';
import fs from 'fs';
import merge from 'webpack-merge';
import common from './webpack.common';

const args = require('minimist')(process.argv);

// Configs
const ENABLE_SSL: boolean = args['https'];

export default merge(common, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    compress: true,
    host: '0.0.0.0',
    publicPath: '/dl-test/',
    port: Number(process.env.PORT) || 2000,
    https: ENABLE_SSL && {
      key: fs.readFileSync(resolve(__dirname, 'ssl/ssl.localhost.key')),
      cert: fs.readFileSync(resolve(__dirname, 'ssl/ssl.localhost.crt')),
    },
    proxy: {
      '/api': {
        target: 'http://localhost',
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
