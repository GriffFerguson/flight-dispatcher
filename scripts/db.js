"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Airport = exports.Route = exports.AirportDB = exports.RouteDB = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class DB {
    constructor(url) {
        this.db = JSON.parse((0, fs_1.readFileSync)(url, { encoding: "utf8" }));
        this.dbURL = url;
    }
    save(data) {
        this.db.push(data);
        (0, fs_1.writeFileSync)(this.dbURL, JSON.stringify(this.db), { encoding: "utf8" });
    }
}
class RouteDB extends DB {
    constructor() {
        super((0, path_1.join)(__dirname, "../data/routes.json"));
        this.id = 0;
    }
}
exports.RouteDB = RouteDB;
class AirportDB extends DB {
    constructor() {
        super((0, path_1.join)(__dirname, "../data/airports.json"));
    }
    lookup(code) {
        if (code.length == 4)
            var search = "icao";
        else
            var search = "iata";
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i][search] == code)
                return this.db[i];
        }
        return false;
    }
}
exports.AirportDB = AirportDB;
class Route {
    constructor(dep, arr) {
        this.departure = dep;
        this.arrival = arr;
    }
}
exports.Route = Route;
class Airport {
    constructor(icao, iata, name, iso, city, country, state) {
        this.icao = icao;
        this.iata = iata;
        this.name = name;
        this.location = {
            city: city,
            state: state || "",
            country: country,
            iso: iso
        };
    }
}
exports.Airport = Airport;
