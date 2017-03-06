const webpack = require('webpack');

exports.devServer = function({ host, port }) {
	return {
		devServer: {
			historyApiFallback: true,
			hotOnly: true,
			stats: 'errors-only',
			host, // Defaults to 'localhost'
			port, // Defaults to 8080
			overlay: {
				errors: true,
				warnings: true,
			},
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
		],
	};
};

exports.lintJavascript = function({ include, exclude, options }) {
	return {
		module: {
			rules: [
				{
					test: /\.js$/,
					include,
					exclude,
					enforce: 'pre',

					loader: 'eslint-loader',
					options,
				}
			],
		},
	};
};

exports.loadCSS = function({ include, exclude } = {}) {
	return {
		module: {
			rules: [
				{
					test: /\.css$/,
					include,
					exclude,

					use: ['style-loader', 'css-loader'],
				},
			],
		},
	};
};
