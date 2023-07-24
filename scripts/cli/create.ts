import {createInterface} from "readline";
import * as Dispatch from "../db";
import fetch from "node-fetch"
require("dotenv").config();

const rl = createInterface(process.stdin, process.stdout);

interface APIRes {
    icao: String,
    iata: String,
    name: String,
    location: String
}

var departure: Dispatch.Airport;
var arrival: Dispatch.Airport;

// Departure
rl.question("Departure ICAO/IATA: ", ans => {
    console.log(ans)
    /*fetch(`https://airport-info.p.rapidapi.com/airport?${ans.length == 3 ? "iata" : "icao"}=${ans}`,{
        method: "GET",
        headers: {
            "X-RapidAPIKey": process.env.RAPIDAPI_KEY!,
            "X-RapidAPIHost": "airport-info.p.rapidapi.com"
        }
    })
    .then(async res => {
        const result: APIRes = await res.json() as APIRes;
        const location: Array<String> = result.location.split(", ");
        departure = new Dispatch.Airport(
            result.icao!,
            result.iata!,
            result.name!,
            location[0],
            location.length == 3 ? location[2] : location [1],
            location.length == 3 ? location[1] : ""
        )
    })*/
});

// Arrival
rl.question("Arrival ICAO/IATA: ", ans => {
    console.log(ans)
    /*fetch(`https://airport-info.p.rapidapi.com/airport?${ans.length == 3 ? "iata" : "icao"}=${ans}`,{
        method: "GET",
        headers: {
            "X-RapidAPIKey": process.env.RAPIDAPI_KEY!,
            "X-RapidAPIHost": "airport-info.p.rapidapi.com"
        }
    })
    .then(async res => {
        const result: APIRes = await res.json() as APIRes;
        const location: Array<String> = result.location.split(", ");
        arrival = new Dispatch.Airport(
            result.icao!,
            result.iata!,
            result.name!,
            location[0],
            location.length == 3 ? location[2] : location [1],
            location.length == 3 ? location[1] : ""
        )
    })*/
});

const route = new Dispatch.Route(departure!, arrival!);

console.log(JSON.stringify(route))