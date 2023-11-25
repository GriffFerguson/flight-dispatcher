# Flight Dispatcher

## Endpoints
`/`: graphical user interface
`/route/<icao>/<icao>`: Get information regarding a full route

## API Endpoints (preface with `/api`)
`/route`: return all routes in the database
`/route/<icao>`: find all flights from a given departure ICAO code
`/route/<icao>/<icao>`: Get information regarding a full route (API version of the equivcalent user endpoint)
`/airport`: return all airports in the database
`/airport/<icao/iata>`: returns information on a specific airport (both ICAO and IATA codes supported)

## Commands
Running from project root
**`node scripts/createRoute.js <icao/iata> <icao/iata> <passenger index> <round trip>`**

Arguments
1. Departure airport's ICAO/IATA code
2. Arrival airport's ICAO/IATA code
3. Passenger index
4. Include round trip (`return` means include round trip, blank means do not)

**node scripts/server.js**

Start server at port 5000