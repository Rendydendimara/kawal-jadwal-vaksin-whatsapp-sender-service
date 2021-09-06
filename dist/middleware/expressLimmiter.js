"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ExpressLimmiter = (0, express_rate_limit_1.default)({
    // jeda block ip address
    windowMs: 10 * 60 * 1000,
    max: 500,
    message: "You have made too many requests to this page, please wait a moment"
});
exports.default = ExpressLimmiter;
//# sourceMappingURL=expressLimmiter.js.map