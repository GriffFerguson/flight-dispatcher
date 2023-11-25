import express from "express";
import { readFileSync } from "fs";
import {join} from "path";
import * as Dispatch from "./db";
import {createRoute} from "./createRoute";

const RouteDatabase = new Dispatch.RouteDB();
const AirportDatabase = new Dispatch.AirportDB();

const app = express();
app.use("/static", express.static(join(__dirname, "../assets")));
app.use("/", express.static(join(__dirname, "../pages")));
app.listen("5000");

// app.get("/", (req, res) => {
//     var file = readFileSync(join(__dirname, "../pages/index.html"), {encoding:"utf8"});
//     res.write(file);
// })

app.get("/route", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(RouteDatabase.db));
    res.end();
})

app.get("/airport", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(AirportDatabase.db));
    res.end();
})

app.use("/route/:dep", (req, res, next) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    })
    var possibleRoutes = RouteDatabase.lookupDeparture(req.params.dep);
    res.write(JSON.stringify(possibleRoutes));
    res.end();
})

app.use("/route/:dep/:arr", (req, res, next) => {
    var route = RouteDatabase.lookup(req.params.dep, req.params.arr)
    if (!route) {
        res.writeHead(404);
        res.end();
        return;
    }
    res.writeHead(200, {
        "Content-Type": "application/json"
    })
    res.send(JSON.stringify(route));
    res.end();
})