// uso este archivo para guardar el puerto en una variable de entorno 
//y no harcode en el codigo

import {config} from 'dotenv';
config();

export default {
    port: process.env.PORT || 4000,
    "tokenLife": 900,
    "refreshTokenLife": 3600
}

