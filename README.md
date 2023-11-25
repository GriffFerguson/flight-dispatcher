# Flight Dispatcher

`npm run test`: Starts server on port 5000

## Endpoints
`/`: graphical user interface
`/route/<icao>`: find all flights from a given departure ICAO code
`/route/<icao>/<icao>`: Get information regarding a full route

## Commands
Running from project root
**`node scripts/createRoute.js <icao/iata> <icao/iata> <passenger index> <round trip>`**
Arguments
1. Departure airport's ICAO/IATA code
2. Arrival airport's ICAO/IATA code
3. Passenger index
4. Include round trip (`return` means include round trip, blank means do not)