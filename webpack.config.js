const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
const glob = require('glob');

const parts = require('./webpack.parts');

const PATHS = {
	app: path.join(__dirname, 'app'),
	build: path.join(__dirname, 'build'),
};

const commonConfig = merge([
	{
		entry: {
			app: PATHS.app,
		},
		output: {
			path: PATHS.build,
			filename: '[chunkhash:8].js',
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'Webpack demo',
			}),
		],
		// dontParse({
		// 	name: 'react',
		// 	path: path.resolve(
		// 		__dirname, 'node_modules/react/dist/react.min.js',
		// 	),
		// }),
	},
	parts.lintJavascript({ include: PATHS.app }),
	parts.lintCSS({ include: PATHS.app }),
	parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
	{
		performance: {
			hints: 'warning', //'error' or false are valid too
			maxEntrypointSize: 100000, // in bytes
			maxAssetSize: 200000, // in bytes
		},
	},
	parts.clean(PATHS.build),
	parts.minifyJavascript({ useSourceMap: true }),
	parts.minifyCSS({
		discardComments: {
			removeAll: true,
		},
		// Run cssnano in safe mode to avoid
		// potentiallu unsafe ones.
		safe: true,
	}),
	parts.attachRevision(),
	parts.extractBundles([
		{
			name: 'vendor',
			minChunks: ({ userRequest }) => (
				userRequest &&
				userRequest.indexOf('node_modules') >= 0 &&
				userRequest.match(/\.js$/)
			),
		},
		{
			name: 'manifest',
			minChunks: Infinity,
		},
	]),
	parts.extractCSS({
		use: ['css-loader', parts.autoprefix()],
	}),
	parts.purifyCSS({
		paths: glob.sync(path.join(PATHS.app, '**', '*')),
	}),
	parts.loadImages({
		options: {
			limit: 15000,
			name: '[hash:8].[ext]',
		},
	}),
	parts.generateSourceMaps({ type: 'source-map' }),
	parts.setFreeVariable(
		'process.env.NODE_ENV',
		'production',
	),
	{
		plugins: [
			new webpack.HashedModuleIdsPlugin(),
		],
		recordsPath: 'records.json',
	},
]);

const developmentConfig = merge([
	{
		output: {
			devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
		},
		plugins: [
			new webpack.NamedModulesPlugin(),
		],
	},
	parts.generateSourceMaps({ type: 'cheap-module-eval-source-amp' }),
	parts.devServer({
		// Customize host/port here if needed
		host: process.env.HOST,
		port: process.env.PORT,
	}),
	parts.loadCSS(),
	parts.loadImages(),
]);

const libraryConfig = merge([
	commonConfig,
	{
		output: {
			filename: '[name].js',
		},
	},
	parts.clean(PATHS.build),
	parts.lintJavascript({ include: PATHS.lib }),
]);

module.exports = function(env) {
	process.env.BABEL_ENV = env;
	if (env === 'production') {
		return merge(commonConfig, productionConfig);
	}

	return merge(commonConfig, developmentConfig);
};
