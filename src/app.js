import express from 'express';
import config from './config';
import productosRoutes from './components/productos/productos.routes';
import usuariosRoutes from './components/usuarios/usuarios.routes';
import dashboardRoutes from './components/usuarios/dashboard';
import verifyToken  from './components/usuarios/validate_token';
import testAPI from './testAPI';
import cors from 'cors';

const app = express();

//Settings - configuro el puerto
app.set('port', config.port)


//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors());

// Routes middlewares
app.use('/api/productos',verifyToken,productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/admin', verifyToken, dashboardRoutes);

//app.use('/testAPI',testAPI)

export default app;