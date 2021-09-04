import express from 'express'
import logger  from 'morgan'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import ExpressLimmiter from  './middleware/expressLimmiter'
import http from 'http'
import { Request, Response, NextFunction } from "express";
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal'
import { IJadwalVaksin } from './interface/IIJadwalVaksin'


const client = new Client({});

const DUMMY_PHONE_NUMBER:string[] = [
  '6282144092221',
  '6282144092221',
  '6282144092221'
];

let IS_CLIENT_READY:boolean = false;

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
  console.log('Client is ready!');
  IS_CLIENT_READY = true;
});

client.initialize();

// Port
const PORT = process.env.PORT || 8080;

// init express app
const app = express();

// Cors enable
app.use(cors());

// Protection from DDOS
app.use(ExpressLimmiter)

// Protection http using helmet
app.use(helmet());

// Morgan logger
app.use(logger('combined'));

// Enable Json Body
app.use(bodyParser.json());

// Router
app.get('/', (req:Request, res:Response, next:NextFunction) => {
  res.send({
    message: 'service connected'
  })
})

app.post('/send-message', async (req:Request, res:Response, next:NextFunction) => {

  const jadwalVaksin:IJadwalVaksin = {
    keterangan: req.body.keterangan ?? null,
    date_timestamp: req.body.date_timestamp ?? null,
    jenis_vaksin: req.body.jenis_vaksin ?? null,
    img_url: req.body.img_url ?? null,  
    link_detail: req.body.link_detail ?? null,  
  }

  // invalid input
  if (!(jadwalVaksin.keterangan && jadwalVaksin.date_timestamp && jadwalVaksin.jenis_vaksin && jadwalVaksin.img_url && jadwalVaksin.link_detail)) {
    return next(new Error('All input is required'))
  }  

  if(!IS_CLIENT_READY) {
    return next(new Error('Client not ready'))
  }

  try {
    const Message:string = `
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
    
    console.log('IS_CLIENT_READY', IS_CLIENT_READY)
    console.log('Message', Message)

    if(client.isRegisteredUser) {
      DUMMY_PHONE_NUMBER.map((userPhone:string) => {
        client.sendMessage(`${userPhone}@c.us`, Message);
        console.log('send to ',userPhone);
      });
    } 

    res.send({
      message: 'Process send to whatsapp running on background'
    });

    } catch(err) {
    return next(err)
  }  
});

// error handler
app.use((err:Error, req:Request, res:Response, next:NextFunction) => {
  console.error('err.message: ', err.message)
  const status = 400 // err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status).send({
    success: false,
    data: null,
    message: err.message
  });
});

// Listen
if(process.env.NODE_ENV === 'development') {
  app.listen(PORT,() => console.log(`server running on port ${PORT}`));
} else {
  const server = http.createServer(app);
  server.listen();
  console.log('Running on', server.address())  
}
 
