import {Router} from 'express';
import { createProducto, getProductos, updateProductoById, deleteProductoById, getProductoById } from './productos.controller';
import verifyToken  from '../usuarios/validate_token';

const router = Router();

router.get('/', getProductos);

router.get('/item/:id', getProductoById)

router.post('/add',verifyToken, createProducto );

router.put('/update/:id',verifyToken, updateProductoById );


router.delete('/delete/:id',verifyToken, deleteProductoById );




export default router;
