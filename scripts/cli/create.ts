import * as Dispatch from "../db";
import fetch from "node-fetch"
require("dotenv").config();

const routes = new Dispatch.RouteDB();
const airports = new Dispatch.AirportDB();

async function fetchAirport(code: String): Promise<Dispatch.Airport | void> {
    var port: Dispatch.Airport;
    
    return new Promise((resolve) => {
        // Check DB
        console.log("Loading data for " + code)
        const portCheck = airports.lookup(code);
        if (portCheck) {
            port = portCheck as Dispatch.Airport;
            resolve(port);
        } else {
            // Fetch API
            console.log("Nothing found in database, fetching API")
            fetch(`https://airport-info.p.rapidapi.com/airport?${code.length == 3 ? "iata" : "icao"}=${code}`,{
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
                    "X-RapidAPI-Host": "airport-info.p.rapidapi.com"
                }
            })
            .then(res => {
                return res.json()
            })
            .then(result => {
                console.log("Processing...")
                const location: Array<String> = result.location.split(", ");
                port = new Dispatch.Airport(
                    result.icao!,
                    result.iata!,
                    result.name!,
                    result.country_iso!,
                    location[0],
                    location.length == 3 ? location[2] : location [1],
                    location.length == 3 ? location[1] : ""
                )
                airports.save(port);
                resolve(port);
            })
            .catch(err => {
                throw err;
            })
        }
    })
}

export async function createRoute(dep: String, arr: String): Promise<void> {
    const departure: Dispatch.Airport = await fetchAirport(dep) as Dispatch.Airport;
    const arrival: Dispatch.Airport = await fetchAirport(arr)! as Dispatch.Airport;
    
    console.log("Saving route")
    const route = new Dispatch.Route(departure, arrival);
    routes.save(route);
    console.log("Done!")
}

if (!process.argv[2] || !process.argv[3]) throw "Invalid arguments";
else createRoute(process.argv[2], process.argv[3]);