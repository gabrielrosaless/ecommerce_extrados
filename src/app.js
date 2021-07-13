import express from 'express';
import config from './config';
import productosRoutes from './components/productos/productos.routes';
import usuariosRoutes from './components/usuarios/usuarios.routes';
import dashboardRoutes from './components/usuarios/dashboard';
import verifyToken  from './components/usuarios/validate_token';


const app = express();

//Settings - configuro el puerto
app.set('port', config.port)


//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))


// Routes middlewares
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/admin', verifyToken, dashboardRoutes);


export default app;