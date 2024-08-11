import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import BigNumber from "bignumber.js";
import exceptionHandler from "./exceptionHandler";
import path from "path";
import initDB from "./database/initdb";
import sequelize from "./database/sequelize";
import { log, ZANO_ASSET_ID, config } from "./utils/utils";


const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ['websocket', 'polling'] });

(async () => {
    await initDB();
    await sequelize.authenticate();
    await sequelize.sync();  

    io.engine.on('initial_headers', (headers, req) => {
        headers['Access-Control-Allow-Origin'] = config.frontend_api
    })
    
    io.engine.on('headers', (headers, req) => {
        headers['Access-Control-Allow-Origin'] = config.frontend_api
    })
    
    app.use(express.static('dist'));
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )
        next()
    })
    

    console.log("Database connected");
})();