import { readFileSync, writeFileSync, PathOrFileDescriptor } from "fs";
import {join} from "path";

// Parent database class
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

// Specific databases
export class RouteDB extends DB {
    pool: Array<number>;
    constructor() {
        super(join(__dirname, "../data/routes.json"))
        //@ts-ignore
        this.pool = this.db.pool;
        //@ts-ignore
        this.db = this.db.routes;
    }

    save(data: Route): void {
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

        // switch (data.id[0]) {
        //     case "0":
        //         this.pool[0]++;
        //         break;
        //     case "1":
        //         this.pool[1]++;
        //         break;
        //     case "2":
        //         this.pool[2]++;
        //         break;
        //     case "3":
        //         this.pool[3]++;
        //         break;
        //     case "4":
        //         this.pool[4]++;
        //         break;
        //     case "5":
        //         this.pool[5]++;
        //         break;
        //     case "6":
        //         this.pool[6]++;
        //         break;
        //     case "7":
        //         this.pool[7]++;
        //         break;
        //     default:
        //         this.pool[8]++;
        //         break;
        // }

        writeFileSync(this.dbURL, `{"pool":${JSON.stringify(this.pool)},"routes":${JSON.stringify(this.db)}}`, {encoding:"utf8"});
    }

    lookupDeparture(code: String): Array<Route> {
        var routes: Array<Route> = [];
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i].dep == code) {
                routes.push(this.db[i])
            }
        }
        return routes;
    }

    lookup(depCode: String, arrCode: String): Route | undefined {
        var opts = this.lookupDeparture(depCode);
        for (var i = 0; i< opts.length; i++) {
            if (opts[i].arr == arrCode) return opts[i];
        }
    }

    getID(num: number): number {
        return this.pool[num];
    }
}

export class AirportDB extends DB {
    constructor() {
        super(join(__dirname, "../data/airports.json"));
    }

    lookup(code: String): Airport | undefined {
        if (code.length == 4) var search = "icao";
        else var search = "iata";
        
        for (var i = 0; i < this.db.length; i++) {
            if (this.db[i][search] == code) return this.db[i];
        }
    }
}

export class AircraftDB extends DB {
    constructor() {
        super(join(__dirname, "../data/airports.json"));
    }
}

interface AptLocation {
    city: String,
    state: String,
    country: String,
    iso: String,
    coordinates: [number, number]
}

// Individual items
export class Route {
    dep: String;
    arr: String;
    dis: Number;
    id: String;
    pax: Number[];
    constructor(dep: Airport, arr: Airport, index: Number[]) {
        this.dep = dep.icao;
        this.arr = arr.icao;
        this.dis = greatCircle(
            dep.location.coordinates[0],
            dep.location.coordinates[1],
            arr.location.coordinates[0],
            arr.location.coordinates[1]
        )
        this.id = flightNumber(this.dep, this.arr);
        this.pax = index;
    }
}

export class Airport {
    icao: String;
    iata: String;
    location: AptLocation;
    name: String;
    hub: boolean | undefined;

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
    pax: Number;
    range: Number;
    loc: String;
    reg: String;
    stat: String;
    
    constructor(type: String, maxPax: Number, range: Number, registration: String) {
        this.type = type;
        this.pax = maxPax;
        this.range = range;
        this.reg = registration;
        this.loc = "KIAH"
        this.stat = "On Ground"
    }

    setLocation(loc: String) {
        this.loc = loc;
    }

    setStatus(msg: String) {
        this.stat = msg;
    }
}

function greatCircle(lat1: number, lon1: number, lat2: number, lon2: number): Number {
    const r = 6371; // km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
                  + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  
    return Math.round((2 * r * Math.asin(Math.sqrt(a))) / 1.852); // Convert to nautical miles
}

function flightNumber(depCode: String, arrCode: String): String {
    var id = [0,"0"];
    // Identify region
    var depRegion = regionID(depCode);
    var arrRegion = regionID(arrCode);

    // First number
    if (depRegion == arrRegion) id[0] = depRegion;
    else id[0] = 8;

    // Other numbers
    id[1] = (new RouteDB()).getID(id[0] as unknown as number);
    if (id[1] < 100) {
        if (id[1] < 10) {
            id[1] = "00" + id[1]
        } else id[1] = "0" + id[1]
    }
    return `${id[0]}${id[1]}`;
}

function regionID (code: String): number {
    switch (code[0]) {
        // North America
        case "C":
        case "K":
        case "M":
        case "B":
            return 0;
        // Europe
        case "E":
        case "L":
            return 1;
        // South America
        case "S":
        case "T":
            return 2;
        // Africa
        case "G":
        case "D":
        case "H":
        case "F":
            return 3;
        // Asia
        case "U":
        case "O":
        case "Z":
        case "V":
        case "R":
        case "W":
        case "A":
            return 4;
        // Australia / Oceania
        case "Y":
        case "N":
            return 5;
        // Pacific Islands
        case "P":
            return 6;
        // Others
        default:
            return 7;
    }
}

// Calculate passenger index
function getPaxIndex(paxCount: number): number {
    if (paxCount < 55) return 0;
    else if (paxCount < 80) return 1;
    else if (paxCount < 100) return 2;
    else if (paxCount < 125) return 3;
    else if (paxCount < 150) return 4;
    else if (paxCount < 180) return 5;
    else if (paxCount < 200) return 6;
    else if (paxCount < 230) return 7;
    else if (paxCount < 250) return 8;
    else if (paxCount < 280) return 9;
    else if (paxCount < 300) return 10;
    else if (paxCount < 330) return 11;
    else if (paxCount < 355) return 12;
    else if (paxCount < 370) return 13;
    else if (paxCount < 400) return 14;
    else if (paxCount < 425) return 15;
    else if (paxCount < 470) return 16;
    else if (paxCount < 510) return 17;
    else if (paxCount < 550) return 18;
    else return 19;
}