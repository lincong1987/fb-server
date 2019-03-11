/*
 This file 'index' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-03-11 11:30
 */

const pkg = require("../package");
const Koa = require('koa');
const staticServer = require('./server');
const proxyServer = require('./proxy');
const compress = require("koa-compress");
const path = require('path');
const _ = require('lodash');

/**
 * 属性合并
 * @param options
 * @returns {*}
 */
const mixConfig = (options) => {
	options.rootDir = options.path || "";
	options.rootPath = options.alias || "/";
	return _.assign({}, {
		//notFoundFile: ``,
		notFoundFile: "src/404.html",
		maxage: 0,
		hidden: false,
		gzip: true,
		last: true
	}, options);
};

/**
 * 静态资源服务器
 * @param app
 * @param options {Object|Array|String}
 * path {String} 映射路径
 * alias {String} 虚拟目录，默认 "/"
 * notFoundFile {String} 404
 * @returns {*}
 */
const doStatic = (app, options) => {

	if (_.isPlainObject(options)) {
		options = [
			mixConfig(options)
		];
	} else if (_.isString(options)) {
		options = [
			mixConfig({
				path: options
			})
		];
	}

	if (!options) {
		options = [mixConfig({})];
	}

	_.isArray(options) && options.forEach((config) => {
		if (_.isString(config)) {
			config = mixConfig({
				path: config
			});
		}
		if (_.isPlainObject(config)) {
			config = mixConfig(config);
		}
		app.use(staticServer(config));
		console.log(`加载静态资源服务器配置: ${JSON.stringify(config)}`);
	});


	return app;

};

const doProxy = (app, proxyOptions) => {

	let defaults = {
		healthCheck: true,
		fallback: true,
		fallbackOption: {},
		compress: {
			filter(content_type) {
				return /text|javascript|html|css/i.test(content_type);
			},
			threshold: 2048,
			flush: require("zlib").Z_SYNC_FLUSH
		}
	};

	proxyOptions = _.assign({}, defaults, proxyOptions);
	
	if (_.isUndefined(proxyOptions.compress)) {
		proxyOptions.compress = true;
	}
	if (proxyOptions.compress === true) {
		app.use(compress(this.option.compress));
	}

	// 代理
	if (proxyOptions.proxyTable) {
		setProxy(app, proxyOptions.proxyTable);
	}

	// url重写
	if (proxyOptions.fallback) {
		const opt = _.assign({verbose: false}, proxyOptions.fallbackOption);
		app.use(doRewrite(opt));
	}


	// 健康检查
	if (proxyOptions.healthCheck) {
		app.use(function (ctx, next) {
			if (!["/health", "/healthcheck"].includes(ctx.req.url.toLowerCase()))
				return next();
			ctx.status = 200;
			ctx.body = "server aliving";
		});
	}

	//app.use(proxyServer(proxyOptions));
};

const doRewrite = (options) => {
	const middleware = require('connect-history-api-fallback')(options);
	const noop = function () {
	};
	return (ctx, next) => {
		middleware(ctx, null, noop);
		return next();
	};
};


// 设置代理
function setProxy(app, proxyTable) {
	if (typeof proxyTable !== "object")
		throw new Error("proxyTable 必须是 object");
	_.keys(proxyTable).forEach(item => {
		let options = proxyTable[item];
		if (typeof options === "string") {
			options = {
				target: options,
				changeOrigin: true,
				logs: true
			};
		}

		console.log(`加载代理服务器配置: ${JSON.stringify(options)}`);
		// 应用代理中间件
		app.use(proxyServer.proxy(item, options));
	});
}

const doStart = (port = 8001, staticOptions, proxyOptions) => {
	const app = new Koa();

	doProxy(app, proxyOptions);

	doStatic(app, staticOptions);



	app.listen(port, () => {
		console.log(`启动成功, 监听端口 http://localhost:${port}/`);
	});

	return app;
};


module.exports = doStart;