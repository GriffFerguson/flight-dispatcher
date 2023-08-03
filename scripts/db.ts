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
    pool: Array<number>;
    constructor() {
        super(join(__dirname, "../data/routes.json"))
        //@ts-ignore
        this.pool = this.db.pool;
        //@ts-ignore
        this.db = this.db.routes;
    }

    save(data: Route) {
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

        writeFileSync(this.dbURL, `{"pool":${JSON.stringify(this.pool)},"routes":${JSON.stringify(this.db)}}`, {encoding:"utf8"});
    }

    lookupDeparture(code: String): Array<Route> {
        var routes: Array<Route> = [];
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i].departure == code) {
                routes.push(this.db[i])
            }
        }
        return routes;
    }

    lookup(depCode: String, arrCode: String): Route | void {
        var opts = this.lookupDeparture(depCode);
        for (var i = 0; i< opts.length; i++) {
            if (opts[i].arrival == arrCode) return opts[i];
        }
    }

    getID(num: number): number {
        return this.pool[num];
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
    iso: String,
    coordinates: [number, number]
}

export class Route {
    departure: String;
    arrival: String;
    distance: Number;
    id: String;
    pax: Number;
    constructor(dep: Airport, arr: Airport, index: Number) {
        this.departure = dep.icao;
        this.arrival = arr.icao;
        this.distance = greatCircle(
            dep.location.coordinates[0],
            dep.location.coordinates[1],
            arr.location.coordinates[0],
            arr.location.coordinates[1]
        )
        this.id = flightNumber(this.departure, this.arrival);
        this.pax = index;
    }
}

export class Airport {
    icao: String;
    iata: String;
    location: AptLocation;
    name: String;

    constructor(icao: String, iata: String, name: String, coords: [number, number], iso: String, city: String, country: String, state?: String) {
        this.icao = icao;
        this.iata = iata;
        this.name = name;
        this.location = {
            city: city,
            state: state || "",
            country: country,
            iso: iso,
            coordinates: coords
        }
    }
}

export class Aircraft {
    type: String;
    maxPax: Number;
    range: Number;
    location: String;
    regstration: String;
    status: String;
    
    constructor(type: String, maxPax: Number, range: Number, registration: String) {
        this.type = type;
        this.maxPax = maxPax;
        this.range = range;
        this.regstration = registration;
        this.location = "KIAH"
        this.status = "On Ground"
    }

    setLocation(loc: String) {
        this.location = loc
    }

    setStatus(msg: String) {
        this.status = msg;
    }
}



function greatCircle(lat1: number, lon1: number, lat2: number, lon2: number): Number {
    const r = 6371; // km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
                  + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  
    return Math.round((2 * r * Math.asin(Math.sqrt(a))) / 1.852);
  }

  function flightNumber(depCode: String, arrCode: String): String {
    var id = [0,"0"];
    // First number
    if (depCode[0] == arrCode[0]) {
        switch (depCode[0]) {
            // North America
            case "C":
            case "K":
            case "M":
            case "B":
                id[0] = "0";
                break;
            // Europe
            case "E":
            case "L":
                id[0] = "1";
                break;
            // South America
            case "S":
            case "T":
                id[0] = "2";
                break;
            // Africa
            case "G":
            case "D":
            case "H":
            case "F":
                id[0] = "3";
                break;
            // Asia
            case "U":
            case "O":
            case "Z":
            case "V":
            case "R":
            case "W":
            case "A":
                id[0] = "4";
                break;
            // Australia / Oceania
            case "Y":
            case "N":
                id[0] = "5";
                break;
            // Pacific Islands
            case "P":
                id[0] = "6";
                break;
            // Others
            default:
                id[0] = "7";
        }
    } else id[0] = "8";
    // Other numbers
    id[1] = (new RouteDB()).getID(id[0] as unknown as number);
    if (id[1] < 100) {
        if (id[1] < 10) {
            id[1] = "00" + id[1]
        } else id[1] = "0" + id[1]
    }
    return `${id[0]}${id[1]}`;
  }