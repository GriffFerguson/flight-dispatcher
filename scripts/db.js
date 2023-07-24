"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRoute = exports.Airport = exports.Route = void 0;
const fs_1 = require("fs");
const dbURL = "./routes.json";
var db = JSON.parse((0, fs_1.readFileSync)(dbURL, { encoding: "utf8" }));
class Route {
    constructor(dep, arr) {
        this.departure = dep;
        this.arrival = arr;
    }
}
exports.Route = Route;
class Airport {
    constructor(icao, iata, name, city, country, state) {
        this.icao = icao;
        this.iata = iata;
        this.name = name;
        this.location = {
            city: city,
            state: state || "",
            country: country
        };
    }
}
exports.Airport = Airport;
function saveRoute(route) {
    db.push(route);
    (0, fs_1.writeFileSync)(dbURL, JSON.stringify(db), { encoding: "utf8" });
}
exports.saveRoute = saveRoute;
