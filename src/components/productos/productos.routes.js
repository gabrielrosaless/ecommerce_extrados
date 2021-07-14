import {Router} from 'express';
import { createProducto, getProductos, updateProductoById, deleteProductoById } from './productos.controller';

const router = Router();

router.get('/', getProductos);

router.post('/add', createProducto );

router.put('/update/:id', updateProductoById );


router.put('/delete/:id', deleteProductoById );




export default router;
