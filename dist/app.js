"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const expressLimmiter_1 = __importDefault(require("./middleware/expressLimmiter"));
const http_1 = __importDefault(require("http"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const client = new whatsapp_web_js_1.Client({
    puppeteer: {
        ignoreDefaultArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});
const DUMMY_PHONE_NUMBER = [
    '6282144092221',
    '6282144092221',
    '6282144092221'
];
let IS_CLIENT_READY = false;
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode_terminal_1.default.generate(qr, { small: true });
});
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Client is ready!');
    IS_CLIENT_READY = true;
}));
client.initialize();
// Port
const PORT = process.env.PORT || 8080;
// init express app
const app = (0, express_1.default)();
// Cors enable
app.use((0, cors_1.default)());
// Protection from DDOS
app.use(expressLimmiter_1.default);
// Protection http using helmet
app.use((0, helmet_1.default)());
// Morgan logger
app.use((0, morgan_1.default)('combined'));
// Enable Json Body
app.use(body_parser_1.default.json());
// Router
app.get('/', (req, res, next) => {
    res.send({
        message: 'service connected'
    });
});
app.post('/send-message', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const jadwalVaksin = {
        keterangan: (_a = req.body.keterangan) !== null && _a !== void 0 ? _a : null,
        date_timestamp: (_b = req.body.date_timestamp) !== null && _b !== void 0 ? _b : null,
        jenis_vaksin: (_c = req.body.jenis_vaksin) !== null && _c !== void 0 ? _c : null,
        img_url: (_d = req.body.img_url) !== null && _d !== void 0 ? _d : null,
        link_detail: (_e = req.body.link_detail) !== null && _e !== void 0 ? _e : null,
    };
    // invalid input
    if (!(jadwalVaksin.keterangan && jadwalVaksin.date_timestamp && jadwalVaksin.jenis_vaksin && jadwalVaksin.img_url && jadwalVaksin.link_detail)) {
        return next(new Error('All input is required'));
    }
    if (!IS_CLIENT_READY) {
        return next(new Error('Client not ready'));
    }
    try {
        const Message = `
      Hallo saya dari Kawal Jadwal Vaksin. Jadwal Informasi Vaksin Terbaru.

      Keterangan: ${jadwalVaksin.keterangan} 
      Waktu: ${new Date(jadwalVaksin.date_timestamp).toLocaleString()}
      Jenis Vaksin: ${jadwalVaksin.jenis_vaksin}

      Kamu bisa cek informasi detailnya disini: ${jadwalVaksin.link_detail}

      Terimakasih 😊
      Salam Sehat

      #SumbaTimurGoVaksin
      #KabarCovidSumbaTimur
    `;
        console.log('IS_CLIENT_READY', IS_CLIENT_READY);
        console.log('Message', Message);
        if (client.isRegisteredUser) {
            DUMMY_PHONE_NUMBER.map((userPhone) => {
                client.sendMessage(`${userPhone}@c.us`, Message);
                console.log('send to ', userPhone);
            });
        }
        res.send({
            message: 'Process send to whatsapp running on background'
        });
    }
    catch (err) {
        return next(err);
    }
}));
// error handler
app.use((err, req, res, next) => {
    console.error('err.message: ', err.message);
    const status = 400; // err.name && err.name === 'ValidationError' ? 400 : 500;
    res.status(status).send({
        success: false,
        data: null,
        message: err.message
    });
});
// Listen
if (process.env.NODE_ENV === 'development') {
    app.listen(PORT, () => console.log(`server running on port ${PORT}`));
}
else {
    const server = http_1.default.createServer(app);
    server.listen();
    console.log('Running on', server.address());
}
//# sourceMappingURL=app.js.map