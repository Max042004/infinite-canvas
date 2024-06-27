//node.js 內見http相關的module
const http = require('http');
//createserver要傳入的參數是function
const server = http.createServer(handler)

//兩個參數分別是req, res
function handler(req, res){
    console.log(req.url); //印出request網址
    res.write("Hello World");
    res.end()
}

server.listen(5001) //常見是80port，設定5001不易衝突

//看看怎麼response回react檔案的東西 6/25