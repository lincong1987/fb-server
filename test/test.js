/*
 This file 'test' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-03-11 15:17
 */

const server = require("../src/index");

let staticConfig = [
	{path: "dist", alias: "/abc"},
	{path: "src"}
];


let proxyConfig = {
	proxyTable: {
		'/api': {
			target: 'http://localhost:8000',
			changeOrigin: false,
			logs: true,
		},
		'/api/v2': {
			target: 'http://localhost:8080',
			changeOrigin: false,
			logs: true,
		},
		"/planb/": {
			target: "http://192.168.0.103:8090/",
			changeOrigin: false,
			logs: false,
		}
	}
};

let rewritesOptions = {

	"/js/(.*)": "/test/js/$1",
	"/css/(.*)": "/public/assets/css/$1",

};


let app = server(3000, staticConfig, proxyConfig, rewritesOptions);

// 以根目录启动
//let app = server(3000);