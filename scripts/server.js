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
const fs_1 = require("fs");
const path_1 = require("path");
const Dispatch = __importStar(require("./db"));
const createRoute_1 = require("./createRoute");
const RouteDatabase = new Dispatch.RouteDB();
const AirportDatabase = new Dispatch.AirportDB();
const app = (0, express_1.default)();
app.listen("5000");
app.get("/", (req, res) => {
    var file = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../pages/index.html"), { encoding: "utf8" });
    res.send(file);
});
app.get("/route", (req, res) => {
    res.send(RouteDatabase);
    res.end();
});
app.get("/airport", (req, res) => {
    res.send(AirportDatabase.db);
    res.end();
});
app.use("/route/:dep", (req, res, next) => {
    var possibleRoutes = RouteDatabase.lookupDeparture(req.params.dep);
    res.send(possibleRoutes);
    res.end();
});
app.use("/route/:dep/:arr", (req, res, next) => {
    var route = RouteDatabase.lookup(req.params.dep, req.params.arr);
    if (!route) {
        (0, createRoute_1.createRoute)(req.params.dep, req.params.arr);
        route = RouteDatabase.lookup(req.params.dep, req.params.arr);
    }
    res.send(route);
});
