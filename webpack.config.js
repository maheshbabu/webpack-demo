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
	parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
	parts.extractBundles([
		{
			name: 'vendor',
			minChunks: ({ userRequest }) => (
				userRequest &&
				userRequest.indexOf('node_modules') >= 0 &&
				userRequest.match(/\.js$/)
			),
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
]);

const developmentConfig = merge([
	{
		output: {
			devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
		},
		plugins: [
			new webpack.NamedModulesPlugin(),
		]
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

module.exports = function(env) {
	process.env.BABEL_ENV = env;
	if (env === 'production') {
		return merge(commonConfig, productionConfig);
	}

	return merge(commonConfig, developmentConfig);
};
