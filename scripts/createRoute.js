"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoute = void 0;
const Dispatch = __importStar(require("./db"));
const node_fetch_1 = __importDefault(require("node-fetch"));
require("dotenv").config();
const routes = new Dispatch.RouteDB();
const airports = new Dispatch.AirportDB();
async function fetchAirport(code) {
    var port;
    return new Promise((resolve) => {
        console.log("Loading data for " + code);
        const portCheck = airports.lookup(code);
        if (portCheck) {
            port = portCheck;
            resolve(port);
        }
        else {
            console.log("Nothing found in database, fetching API");
            (0, node_fetch_1.default)(`https://airport-info.p.rapidapi.com/airport?${code.length == 3 ? "iata" : "icao"}=${code}`, {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "airport-info.p.rapidapi.com"
                }
            })
                .then(res => {
                return res.json();
            })
                .then(result => {
                console.log("Processing...");
                const location = result.location.split(", ");
                port = new Dispatch.Airport(result.icao, result.iata, result.name, [result.latitude, result.longitude], result.country_iso, location[0], location.length == 3 ? location[2] : location[1], location.length == 3 ? location[1] : "");
                airports.save(port);
                resolve(port);
            })
                .catch(err => {
                throw err;
            });
        }
    });
}
async function createRoute(dep, arr) {
    const departure = await fetchAirport(dep);
    const arrival = await fetchAirport(arr);
    console.log("Saving route");
    const route = new Dispatch.Route(departure, arrival);
    routes.save(route);
    console.log("Done!");
}
exports.createRoute = createRoute;
if (process.argv[2] || process.argv[3])
    createRoute(process.argv[2], process.argv[3]);
if (process.argv[4] == "return")
    createRoute(process.argv[3], process.argv[2]);
