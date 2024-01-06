"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aircraft = exports.Airport = exports.Route = exports.AircraftDB = exports.AirportDB = exports.RouteDB = void 0;
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
        this.pool = this.db.pool;
        this.db = this.db.routes;
    }
    save(data) {
        var duplicate = this.lookup(data.dep, data.arr);
        if (duplicate) {
            console.error("Route already exists");
            return;
        }
        this.db.push(data);
        var poolIndex = parseInt(data.id[0]);
        this.pool[poolIndex]++;
        if (this.pool[poolIndex] > 999) {
            this.pool[poolIndex] = 1;
        }
        (0, fs_1.writeFileSync)(this.dbURL, `{"pool":${JSON.stringify(this.pool)},"routes":${JSON.stringify(this.db)}}`, { encoding: "utf8" });
    }
    lookupDeparture(code) {
        var routes = [];
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i].dep == code) {
                routes.push(this.db[i]);
            }
        }
        return routes;
    }
    lookup(depCode, arrCode) {
        var opts = this.lookupDeparture(depCode);
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].arr == arrCode)
                return opts[i];
        }
    }
    getID(num) {
        return this.pool[num];
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
    }
}
exports.AirportDB = AirportDB;
class AircraftDB extends DB {
    constructor() {
        super((0, path_1.join)(__dirname, "../data/airports.json"));
    }
}
exports.AircraftDB = AircraftDB;
class Route {
    constructor(dep, arr, index) {
        this.dep = dep.icao;
        this.arr = arr.icao;
        this.dis = greatCircle(dep.location.coordinates[0], dep.location.coordinates[1], arr.location.coordinates[0], arr.location.coordinates[1]);
        this.id = flightNumber(this.dep, this.arr);
        this.pax = index;
    }
}
exports.Route = Route;
class Airport {
    constructor(icao, iata, name, coords, iso, city, country, state) {
        this.icao = icao;
        this.iata = iata;
        this.name = name;
        this.location = {
            city: city,
            state: state || "",
            country: country,
            iso: iso,
            coordinates: coords
        };
    }
}
exports.Airport = Airport;
class Aircraft {
    constructor(type, maxPax, range, registration) {
        this.type = type;
        this.pax = maxPax;
        this.range = range;
        this.reg = registration;
        this.loc = "KIAH";
        this.stat = "On Ground";
    }
    setLocation(loc) {
        this.loc = loc;
    }
    setStatus(msg) {
        this.stat = msg;
    }
}
exports.Aircraft = Aircraft;
function greatCircle(lat1, lon1, lat2, lon2) {
    const r = 6371;
    const p = Math.PI / 180;
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
        + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
            (1 - Math.cos((lon2 - lon1) * p)) / 2;
    return Math.round((2 * r * Math.asin(Math.sqrt(a))) / 1.852);
}
function flightNumber(depCode, arrCode) {
    var id = [0, "0"];
    var depRegion = regionID(depCode);
    var arrRegion = regionID(arrCode);
    if (depRegion == arrRegion)
        id[0] = depRegion;
    else
        id[0] = 8;
    id[1] = (new RouteDB()).getID(id[0]);
    if (id[1] < 100) {
        if (id[1] < 10) {
            id[1] = "00" + id[1];
        }
        else
            id[1] = "0" + id[1];
    }
    return `${id[0]}${id[1]}`;
}
function regionID(code) {
    switch (code[0]) {
        case "C":
        case "K":
        case "M":
        case "B":
            return 0;
        case "E":
        case "L":
            return 1;
        case "S":
        case "T":
            return 2;
        case "G":
        case "D":
        case "H":
        case "F":
            return 3;
        case "U":
        case "O":
        case "Z":
        case "V":
        case "R":
        case "W":
        case "A":
            return 4;
        case "Y":
        case "N":
            return 5;
        case "P":
            return 6;
        default:
            return 7;
    }
}
function getPaxIndex(paxCount) {
    if (paxCount < 55)
        return 0;
    else if (paxCount < 80)
        return 1;
    else if (paxCount < 100)
        return 2;
    else if (paxCount < 125)
        return 3;
    else if (paxCount < 150)
        return 4;
    else if (paxCount < 180)
        return 5;
    else if (paxCount < 200)
        return 6;
    else if (paxCount < 230)
        return 7;
    else if (paxCount < 250)
        return 8;
    else if (paxCount < 280)
        return 9;
    else if (paxCount < 300)
        return 10;
    else if (paxCount < 330)
        return 11;
    else if (paxCount < 355)
        return 12;
    else if (paxCount < 370)
        return 13;
    else if (paxCount < 400)
        return 14;
    else if (paxCount < 425)
        return 15;
    else if (paxCount < 470)
        return 16;
    else if (paxCount < 510)
        return 17;
    else if (paxCount < 550)
        return 18;
    else
        return 19;
}
