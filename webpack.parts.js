const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

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
				},
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
			],
		},
		plugins: [
			// output extracted CSS to a filename
			new ExtractTextPlugin('[contenthash:8].css'),
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

exports.clean = function(path) {
	return {
		plugins: [
			new CleanWebpackPlugin([path]),
		],
	};
};

exports.attachRevision = function() {
	return {
		plugins: [
			new webpack.BannerPlugin({
				banner: new GitRevisionPlugin().version(),
			}),
		],
	};
};

exports.minifyJavascript = function({ useSourceMap }) {
	return {
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				beautify: false, // Don't beautify output (uglier to read)

				//Preserve comments,
				comments: false,

				//Extract comments to a seperate file. This works only
				// if comments is set to true above
				extractComments: false,

				sourceMap: useSourceMap,
				compress: {
					warnings: false,
					drop_console: true, // Drop 'console' statements
				},

				// Mangling specific options
				mangle: {
					except: ['$', 'webpack-Jsonp'], // Don't mangle $
					screw_ie8 : true, // Don't care about IE8
					keep_fname: true, // Don't mangle function names
				},
			}),
		],
	};
};

exports.minifyCSS = function({ options }) {
	return {
		plugins: [
			new OptimizeCSSAssetsPlugin({
				cssProcessor: cssnano,
				cssProcessorOptions: options,
			}),
		],
	};
};

exports.setFreeVariable = function(key, value) {
	const env = {};
	env[key] = JSON.stringify(value);

	return {
		plugins: [
			new webpack.DefinePlugin(env),
		],
	};
};

exports.dontParse = function({ name, path }) {
	const alias = {};
	alias[name] = path;

	return {
		module: {
			noParse: [
				new RegExp(path),
			],
		},
	};
};
