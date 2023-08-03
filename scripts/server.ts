import express from "express";
import { readFileSync } from "fs";
import {join} from "path";
import * as Dispatch from "./db";
import {createRoute} from "./createRoute";

const RouteDatabase = new Dispatch.RouteDB();
const AirportDatabase = new Dispatch.AirportDB();

const app = express();
app.listen("5000");

app.get("/", (req, res) => {
    var file = readFileSync(join(__dirname, "../pages/index.html"), {encoding:"utf8"});
    res.send(file);
})

app.get("/route", (req, res) => {
    res.send(RouteDatabase);
    res.end();
})

app.get("/airport", (req, res) => {
    res.send(AirportDatabase.db);
    res.end();
})

app.use("/route/:dep", (req, res, next) => {
    var possibleRoutes = RouteDatabase.lookupDeparture(req.params.dep);
    res.send(possibleRoutes);
    res.end();
})

app.use("/route/:dep/:arr", (req, res, next) => {
    var route = RouteDatabase.lookup(req.params.dep, req.params.arr)
    if (!route) {
        createRoute(req.params.dep, req.params.arr);
        route = RouteDatabase.lookup(req.params.dep, req.params.arr);
    }
    res.send(route);
})