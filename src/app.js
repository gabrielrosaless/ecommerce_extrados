import express from 'express';
import config from './config';
import productosRoutes from './components/productos/productos.routes';
import usuariosRoutes from './components/usuarios/usuarios.routes';
import pedidosRoutes from './components/pedidos/pedidos.routes';
//import dashboardRoutes from './components/usuarios/dashboard';
// import testAPI from './testAPI';
import cors from 'cors';

const errorMiddleware = require('./utils/error');


const app = express();

//Settings - configuro el puerto
app.set('port', config.port);


//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());


// Routes middlewares
app.use('/api/productos',productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos',pedidosRoutes);


//Middleware to handle errors
app.use(errorMiddleware);
//app.use('/api/admin', dashboardRoutes);
//app.use('/testAPI',testAPI)

export default app;