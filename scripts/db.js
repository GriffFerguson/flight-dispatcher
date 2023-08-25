"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aircraft = exports.Airport = exports.Route = exports.AirportDB = exports.RouteDB = void 0;
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
        var duplicate = this.lookup(data.departure, data.arrival);
        if (duplicate) {
            console.error("Route already exists");
            return;
        }
        this.db.push(data);
        switch (data.id[0]) {
            case "0":
                this.pool[0]++;
                break;
            case "1":
                this.pool[1]++;
                break;
            case "2":
                this.pool[2]++;
                break;
            case "3":
                this.pool[3]++;
                break;
            case "4":
                this.pool[4]++;
                break;
            case "5":
                this.pool[5]++;
                break;
            case "6":
                this.pool[6]++;
                break;
            case "7":
                this.pool[7]++;
                break;
            default:
                this.pool[8]++;
                break;
        }
        (0, fs_1.writeFileSync)(this.dbURL, `{"pool":${JSON.stringify(this.pool)},"routes":${JSON.stringify(this.db)}}`, { encoding: "utf8" });
    }
    lookupDeparture(code) {
        var routes = [];
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i].departure == code) {
                routes.push(this.db[i]);
            }
        }
        return routes;
    }
    lookup(depCode, arrCode) {
        var opts = this.lookupDeparture(depCode);
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].arrival == arrCode)
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
        return false;
    }
}
exports.AirportDB = AirportDB;
class Route {
    constructor(dep, arr, index) {
        this.departure = dep.icao;
        this.arrival = arr.icao;
        this.distance = greatCircle(dep.location.coordinates[0], dep.location.coordinates[1], arr.location.coordinates[0], arr.location.coordinates[1]);
        this.id = flightNumber(this.departure, this.arrival);
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
        this.maxPax = maxPax;
        this.range = range;
        this.regstration = registration;
        this.location = "KIAH";
        this.status = "On Ground";
    }
    setLocation(loc) {
        this.location = loc;
    }
    setStatus(msg) {
        this.status = msg;
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
