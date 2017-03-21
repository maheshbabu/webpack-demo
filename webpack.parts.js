const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

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

					use: ['style-loader', 'css-loader', 'resolve-url-loader'],
				},
				{
					test: /\.scss$/,
					include,
					exclude,

					use: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader?sourceMap'],
				},
			],
		},
	};
};

exports.extractCSS = function({ include, exclude, use }) {
	return {
		module: {
			rules: [
				{
					test: /\.css$/,
					include,
					exclude,

					use: ExtractTextPlugin.extract({
						use: use,
						fallback: 'style-loader',
					}),
				},
			]
		},
		plugins: [
			// output extracted CSS to a filename
			new ExtractTextPlugin('[name].css'),
		],
	};
};

exports.autoprefix = function() {
	return {
		loader: 'postcss-loader',
		options: {
			plugins: () => ([
					require('autoprefixer'),
			]),
		},
	};
};

exports.purifyCSS = function({ paths }) {
	return {
		plugins: [
			new PurifyCSSPlugin({ paths: paths }),
		],
	};
};

exports.lintCSS = function({ include, exclude }) {
	return {
		module: {
			rules: [
				{
					test: /\.css$/,
					include,
					exclude,
					enforce: 'pre',

					loader: 'postcss-loader',
					options: {
						plugins: () => ([
							require('stylelint')({
								//ignore node_modules CSS
								ignoreFiles: 'node_modules/**/*.css',
							}),
						]),
					},
				},
			],
		},
	};
};

exports.loadImages = function({ include, exclude, options } = {}) {
	return {
		module: {
			rules: [
				{
					test: /\.(png|jpg)$/,
					include,
					exclude,

					use: {
						loader: 'url-loader',
						options,
					},
				},
			],
		},
	};
};

exports.loadJavaScript = function({ include, exclude }) {
	return {
		module: {
			rules: [
				{
					test: /\.js$/,
					include,
					exclude,

					loader: 'babel-loader',
					options: {
						// Enable caching for improved performance during // development
						// It uses default OS directory by default. If you
						// need something more custom, pass a path to it.
						// i.e., { cacheDirectory: '<path>' }
						cacheDirectory: true,
					},
				},
			],
		},
	};
};

exports.generateSourceMaps = function({ type }) {
	return {
		devtool: type,
	};
};

exports.extractBundles = function(bundles) {
	const entry = {};
	const plugins = [];

	bundles.forEach((bundle) => {
		const { name, entries } = bundle;

		if (entries) {
			entry[name] = entries;
		}

		plugins.push (
			new webpack.optimize.CommonsChunkPlugin(bundle)
		);
	});

	return { entry, plugins };
};
