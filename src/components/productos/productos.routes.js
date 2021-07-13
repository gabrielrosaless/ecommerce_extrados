import {Router} from 'express';

import { createProducto, getProductos, updateProductoById, deleteProductoById } from './productos.controller';

const router = Router();

router.get('/productos', getProductos);

router.post('/productos/add', createProducto );

router.put('/productos/update/:id', updateProductoById );


router.put('/productos/delete/:id', deleteProductoById );




export default router;
