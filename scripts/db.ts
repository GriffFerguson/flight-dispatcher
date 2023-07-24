import { readFileSync, writeFileSync } from "fs";
const dbURL = "./routes.json";
var db: Array<Route> = JSON.parse(readFileSync(dbURL, {encoding:"utf8"}));

interface AptLocation {
    city: String,
    state: String,
    country: String
}

export class Route {
    departure: Airport;
    arrival: Airport;
    constructor(dep: Airport, arr: Airport) {
        this.departure = dep;
        this.arrival = arr;
    }
}

export class Airport {
    icao: String;
    iata: String;
    location: AptLocation;
    name: String;

    constructor(icao: String, iata: String, name: String, city: String, country: String, state?: String) {
        this.icao = icao;
        this.iata = iata;
        this.name = name;
        this.location = {
            city: city,
            state: state || "",
            country: country
        }
    }
}

export function saveRoute(route: Route) {
    db.push(route);
    writeFileSync(dbURL, JSON.stringify(db), {encoding:"utf8"});
}
