import path from 'path';
import _ from 'lodash';
import webpackMerge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import config from '../../../src/config';
import base from './base.config.babel';

const publicPath = '/dist/';
const rootDir = config.dir.root;

export default webpackMerge(base, {
  entry: {
    index: path.join(rootDir, 'src/client/index.js'),
  },
  output: {
    path: path.join(rootDir, publicPath),
    publicPath,
    filename: '[name].js',
    chunkFilename: 'script/[name].bundle.js',
  },
  devServer: {
    hot: true,
    host: '0.0.0.0',
    useLocalIp: true,
    historyApiFallback: {
      index: path.join(publicPath, 'index.html'),
    },
    publicPath,
    proxy: [{
      // context: ['**', `!${config.server.path.admin}`, `!${config.server.path.user}`],
      context: ['**', `!${config.server.path.admin}`, `!${config.server.path.user}`, `!${config.server.path.admin}/**`, `!${config.server.path.user}/**`],
      target: `http://localhost:${config.server.port}`,
    }],
    port: 8080,
    disableHostCheck: true,
    open: true,
    openPage: `${_.trimStart(config.server.path.admin, '/')}`,
    overlay: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'My App',
      template: 'src/client/index.html',
    }),
  ],
});
