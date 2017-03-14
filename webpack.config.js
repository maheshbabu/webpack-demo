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
			filename: '[name].js',
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'Webpack demo',
			}),
		],
	},
	parts.lintJavascript({ include: PATHS.app }),
	parts.lintCSS({ include: PATHS.app }),
	//parts.loadCSS(),
]);

const productionConfig = merge([
	parts.extractCSS({
		use: ['css-loader', parts.autoprefix()],
	}),
	parts.purifyCSS({
		paths: glob.sync(path.join(PATHS.app, '**', '*')),
	}),
]);

const developmentConfig = merge([
	{
		plugins: [
			new webpack.NamedModulesPlugin(),
		]
	},
	parts.devServer({
		// Customize host/port here if needed
		host: process.env.HOST,
		port: process.env.PORT,
	}),
	parts.loadCSS(),
]);

module.exports = function(env) {
	if (env === 'production') {
		return merge(commonConfig, productionConfig);
	}

	return merge(commonConfig, developmentConfig);
};
