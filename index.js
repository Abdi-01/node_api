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
        let data = JSON.parse(fs.readFileSync('./db.json')); // mengakses isi file db.json
        if (req.method == "GET") {

            console.log(data)

            let reqQuery = url.parse(req.url, true).query;

            if (reqQuery.id) {
                let filterData = data.users.filter((val) => reqQuery.id == val.id)
                res.end(JSON.stringify(filterData));
            } else {
                res.end(JSON.stringify(data.users));
            }

        } else if (req.method == "DELETE") {
            let reqQuery = url.parse(req.url, true).query

            if (reqQuery.id) {
                let idx = data.users.findIndex((val) => reqQuery.id == val.id)
                data.users.splice(idx, 1)

                // menulis ulang file db.json dengan dataUsers yang baru
                fs.writeFileSync("./db.json", JSON.stringify(data))

                res.end(JSON.stringify(data.users));
            } else {
                res.end('data not found');
            }

        } else if (req.method == "POST") {

            let body = [];
            // on = untuk membaca event dari request
            // data = untuk membaca bagian data request
            req.on("data", (chunk) => {
                // menampung buffer
                console.log(chunk);
                body.push(chunk)
            }).on("end", () => {
                // Merubah data buffer menjadi data object
                let reqBody = JSON.parse(Buffer.concat(body).toString())
                console.log(reqBody);
                // 1. penambahan property id kedalam data reqBody
                reqBody.id = data.users[data.users.length - 1].id + 1
                // 2. menambahkan data reqBody kedalam dataUsers
                data.users.push(reqBody)
                // 3. menulis ulang isi file db.json dengan dataUsers yang baru
                fs.writeFileSync("./db.json", JSON.stringify(data))
                // 4. Mengirimkan respons data yang baru kepada client
                res.writeHead(201, "Add user success");
                res.write(JSON.stringify(data.users));
                res.end();
            })
        } else if (req.method == "PATCH") {
            // 1. Mendapat parameter data id yang mau diupdate berdasarkan req.query
            let reqQuery = url.parse(req.url, true).query
            // 2. Mendapatkan data yang baru dari req.body
            let body = [];
            req.on("data", (chunk) => {
                body.push(chunk)
            }).on("end", () => {
                let reqBody = JSON.parse(Buffer.concat(body).toString())
                // 3. Mencari idx data yang ingin dirubah berdasarkan req.query
                let idx = data.users.findIndex(val => val.id == reqQuery.id)
                //4 mencari property yang sama antara data yang baru dengan dataUsers yang ingin dirubah. 
                // Menggunkan looping object ✅

                //5 jika porpertinya sama, maka datanya harus diperbarui ✅
                // cara 1
                for (let properti in data.users[idx]) {
                    for (let bodyProperti in reqBody) {
                        console.log("cek nama property", properti, bodyProperti)
                        if (properti == bodyProperti) {
                            data.users[idx][properti] = reqBody[bodyProperti]
                        } else {
                            data.users[idx][bodyProperti] = reqBody[bodyProperti]
                        }
                    }
                }

                // cara 2
                // data.users[idx] = { ...data.users[idx], ...reqBody }; // concatination object javascript

                // 6. jika sudah diperbarui, tulis ulang pada db.json
                fs.writeFileSync("./db.json", JSON.stringify(data))
                // 7. kirimkan responnya
                res.writeHead(201, "update data success");
                res.write(fs.readFileSync("./db.json"));
                res.end();
            })

        } else if (req.method == "PUT") {
            // 1. Mendapat parameter data id yang mau diupdate berdasarkan req.query
            let reqQuery = url.parse(req.url, true).query
            // 2. Mendapatkan data yang baru dari req.body
            let body = [];
            req.on("data", (chunk) => {
                body.push(chunk)
            }).on("end", () => {
                let reqBody = JSON.parse(Buffer.concat(body).toString())
                // 3. Mencari idx data yang ingin dirubah berdasarkan req.query
                let idx = data.users.findIndex(val => val.id == reqQuery.id)
                // 4. menimpa data user yang lama dengan data yang baru ❌
                data.users[idx] = {
                    id: data.users[idx].id,
                    ...reqBody
                }

                // 5. jika sudah diperbarui, tulis ulang pada db.json
                fs.writeFileSync("./db.json", JSON.stringify(data))
                // 6. kirimkan responnya
                res.writeHead(201, "update data success");
                res.write(fs.readFileSync("./db.json"));
                res.end();
            })


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