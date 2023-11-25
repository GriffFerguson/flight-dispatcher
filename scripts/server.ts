import express from "express";
import {join} from "path";
import * as Dispatch from "./db";
import {createRoute} from "./createRoute";
import pug from "pug";

const RouteDatabase = new Dispatch.RouteDB();
const AirportDatabase = new Dispatch.AirportDB();

const app = express();
app.use("/static", express.static(join(__dirname, "../assets")));
app.use("/", express.static(join(__dirname, "../pages")));
app.listen("5000");

const routeTemplate = pug.compileFile("./templates/route.pug");

app.get("/route/:dep/:arr", (req, res) => {
    var html = routeTemplate({
        dep: AirportDatabase.lookup(req.params.dep),
        arr: AirportDatabase.lookup(req.params.arr),
        route: RouteDatabase.lookup(req.params.dep, req.params.arr)
    });
    res.writeHead(200);
    res.end(html);
})

// API ENDPOINTS
app.get("/api/route", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(RouteDatabase.db));
    res.end();
})

app.get("/api/airport", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(AirportDatabase.db));
    res.end();
})

app.get("/api/route/:dep", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    })
    var possibleRoutes = RouteDatabase.lookupDeparture(req.params.dep);
    res.write(JSON.stringify(possibleRoutes));
    res.end();
})

app.get("/api/route/:dep/:arr", (req, res) => {
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