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

let app = server(3000, [{path: "dist", alias: "/abc"}, {path: "src"}], () => {
	console.log("服务启动成功");
});