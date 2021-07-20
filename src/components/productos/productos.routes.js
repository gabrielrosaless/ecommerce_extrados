import {Router} from 'express';
import { createProducto, getProductos, updateProductoById, deleteProductoById, getProductoById } from './productos.controller';
import verifyToken  from '../usuarios/validate_token';

const router = Router();

router.get('/', getProductos); //Para el front hasta que haga el login
//router.get('/', verifyToken, getProductos);

router.get('/item/:id', getProductoById)
//router.get('/item/:id', verifyToken, getProductoById)

router.post('/add',verifyToken, createProducto );

//Este para hacerlo desde el front sin validacion, 
//router.post('/add', createProducto );

router.put('/update/:id',verifyToken, updateProductoById );


router.delete('/delete/:id',verifyToken, deleteProductoById );




export default router;
