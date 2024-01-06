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
const airportTemplate = pug.compileFile("./templates/airport.pug");

app.get("/airport/:dep", (req, res) => {
    const dep = AirportDatabase.lookup(req.params.dep) as Dispatch.Airport;
    const routes = RouteDatabase.lookupDeparture(req.params.dep);
    var arr: Dispatch.Airport[] = [];

    for (var i = 0; i < routes.length; i++) {
        var apt = AirportDatabase.lookup(routes[i].arr);
        arr.push(apt as Dispatch.Airport);
    }

    if (!dep.hub) {
        dep.hub = false;
    }

    const html = airportTemplate({
        depApt: dep,
        flights: routes,
        arrApts: JSON.stringify(arr)
    });
    res.writeHead(200);
    res.end(html);
})

app.get("/route/:dep/:arr", (req, res) => {
    var route = RouteDatabase.lookup(req.params.dep, req.params.arr);
    if (!route) {
        res.writeHead(404);
        res.write(`<title>Error 404: No Route Found</title>`)
        res.end(`<p style=\"font-family:monospace\">Error: The route departing from ${req.params.dep} and arriving at ${req.params.arr} does not exist.<br><a href=\"/\">Return home</a></p>`);
        return;
    }

    var html = routeTemplate({
        dep: AirportDatabase.lookup(req.params.dep),
        arr: AirportDatabase.lookup(req.params.arr),
        route: route
    });
    res.writeHead(200);
    res.end(html);
})

// API ENDPOINTS
// Routes
app.get("/api/route", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(RouteDatabase.db));
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
        res.end("Error 404: Route does not exist");
        return;
    }
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(route));
    res.end();
})
// Airports
app.get("/api/airport", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(AirportDatabase.db));
    res.end();
})

app.get("/api/airport/:code", (req, res) => {
    var port = AirportDatabase.lookup(req.params.code);
    if (port) {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(port));
    } else {
        res.writeHead(404);
    }
    res.end();
})