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
const koaStatic = require('./server');
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
		notFoundFile: `<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
						<title>no such file or directory</title>
					</head>
					<body>
					<h2>404 not found</h2> 
					<div>fb-server ${pkg.version}</div>
					</body>
					</html>`,
		maxage: 0,
		hidden: false,
		gzip: true,
		last: true
	}, options);
};

/**
 * 启动服务器
 * @param port
 * @param options {Object|Array|String}
 * path {String} 映射路径
 * alias {String} 虚拟目录，默认 "/"
 * notFoundFile {String} 404
 * @param callback
 * @returns {*}
 */
const init = (port, options, callback) => {
	const app = new Koa();

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

	_.isArray(options) && options.forEach((config) => {
		if (_.isString(config)) {
			config = mixConfig({
				path: config
			});
		}
		if (_.isPlainObject(config)) {
			config = mixConfig(config);
		}
		//let _path = path.resolve(__dirname, config.path);
		app.use(koaStatic(config));
		console.log(`加载服务器配置: ${JSON.stringify(config)}`);
	});

	app.listen(port, () => {
		console.log(`启动成功, 监听端口 http://localhost:${port}/`);
		callback && typeof callback === "function" && callback.apply(this, Array.prototype.slice.call(arguments));
	});

	return app;

};

module.exports = init;