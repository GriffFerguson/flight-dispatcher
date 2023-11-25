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
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const Dispatch = __importStar(require("./db"));
const pug_1 = __importDefault(require("pug"));
const RouteDatabase = new Dispatch.RouteDB();
const AirportDatabase = new Dispatch.AirportDB();
const app = (0, express_1.default)();
app.use("/static", express_1.default.static((0, path_1.join)(__dirname, "../assets")));
app.use("/", express_1.default.static((0, path_1.join)(__dirname, "../pages")));
app.listen("5000");
const routeTemplate = pug_1.default.compileFile("./templates/route.pug");
app.get("/route/:dep/:arr", (req, res) => {
    var html = routeTemplate({
        dep: AirportDatabase.lookup(req.params.dep),
        arr: AirportDatabase.lookup(req.params.arr),
        route: RouteDatabase.lookup(req.params.dep, req.params.arr)
    });
    res.writeHead(200);
    res.end(html);
});
app.get("/api/route", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(RouteDatabase.db));
    res.end();
});
app.get("/api/route/:dep", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    var possibleRoutes = RouteDatabase.lookupDeparture(req.params.dep);
    res.write(JSON.stringify(possibleRoutes));
    res.end();
});
app.get("/api/route/:dep/:arr", (req, res) => {
    var route = RouteDatabase.lookup(req.params.dep, req.params.arr);
    if (!route) {
        res.writeHead(404);
        res.end();
        return;
    }
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.send(JSON.stringify(route));
    res.end();
});
app.get("/api/airport", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(AirportDatabase.db));
    res.end();
});
app.get("/api/airport/:code", (req, res) => {
    var port = AirportDatabase.lookup(req.params.code);
    if (port) {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(port));
    }
    else {
        res.writeHead(404);
    }
    res.end();
});
