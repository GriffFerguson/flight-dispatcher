import { readFileSync, writeFileSync, PathOrFileDescriptor } from "fs";
import {join} from "path";

class DB {
    db: Array<any>;
    dbURL: PathOrFileDescriptor
    constructor(url: PathOrFileDescriptor) {
        this.db = JSON.parse(readFileSync(url, {encoding:"utf8"}));
        this.dbURL = url;
    }
    
    save(data: Object): void {
        this.db.push(data);
        writeFileSync(this.dbURL, JSON.stringify(this.db), {encoding:"utf8"});
    }
}

export class RouteDB extends DB {
    id = 0;
    constructor() {
        super(join(__dirname, "../data/routes.json"))
    }

    save(data: Route) {
        for(var i = 0; i < this.db.length; i++) {
            if(this.db[i].departure.icao == data.departure.icao && this.db[i].arrival.icao == data.arrival.icao) {
                console.error("Route already exists");
                return;
            }
        }
        this.db.push(data);
        writeFileSync(this.dbURL, JSON.stringify(this.db), {encoding:"utf8"});
    }
}

export class AirportDB extends DB {
    constructor() {
        super(join(__dirname, "../data/airports.json"))
    }

    lookup(code: String): Airport | boolean {
        if (code.length == 4) var search = "icao";
        else var search = "iata";
        
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i][search] == code) return this.db[i]
        }
        return false;
    }
}

interface AptLocation {
    city: String,
    state: String,
    country: String,
    iso: String
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

    constructor(icao: String, iata: String, name: String, iso: String, city: String, country: String, state?: String) {
        this.icao = icao;
        this.iata = iata;
        this.name = name;
        this.location = {
            city: city,
            state: state || "",
            country: country,
            iso: iso
        }
    }
}