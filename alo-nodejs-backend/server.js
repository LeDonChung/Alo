require('dotenv').config();
const app = require('./src/app');  // Express app (API)
const http = require('http');


const server = http.createServer(app);

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
});
