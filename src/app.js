import express from 'express';
import config from './config';
import productosRoutes from './routes/productos.routes';

const app = express();

//Settings - configuro el puerto
app.set('port', config.port)

//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))



app.use(productosRoutes);

export default app;