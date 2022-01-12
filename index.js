const http = require('http'); // import module http untuk membuat app server
const fs = require('fs'); // memanipulasi file pada node js
const url = require('url');

const PORT = 2000; // PORT running aplikasi back end

// Initialisasi app server
const server = http.createServer((req, res) => {

    console.log("info req url :", req.url)
    if (req.url == "/") {
        res.end("<h1>Hello API</h1>");
    } else if (req.url.includes("users")) {
        console.log("info req method :", req.method)
        let dataUsers = JSON.parse(fs.readFileSync('./db.json')); // mengakses isi file db.json
        if (req.method == "GET") {

            console.log(dataUsers)

            let reqQuery = url.parse(req.url, true).query;

            if (reqQuery.id) {
                let filterData = dataUsers.users.filter((val) => reqQuery.id == val.id)
                res.end(JSON.stringify(filterData));
            } else {
                res.end(JSON.stringify(dataUsers));
            }

        } else if (req.method == "DELETE") {
            let reqQuery = url.parse(req.url, true).query

            if (reqQuery.id) {
                let idx = dataUsers.users.findIndex((val) => reqQuery.id == val.id)
                dataUsers.users.splice(idx, 1)

                // menulis ulang file db.json dengan dataUsers yang baru
                fs.writeFileSync("./db.json", JSON.stringify(dataUsers))

                res.end(JSON.stringify(dataUsers.users));
            } else {
                res.end('data not found');
            }

        } else {
            res.writeHead(404, "Method not found")
            res.end("<h1>404 Not Found</h1>");
        }
    } else {
        res.writeHead(404, "URL not found")
        res.end("<h1>404 Not Found</h1>");
    }
})

// menjalankan app server
server.listen(PORT, () => console.log("Node JS App Server :", PORT))