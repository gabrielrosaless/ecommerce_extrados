import {Router} from 'express';

import { createProducto, getProductos, updateProductoById, deleteProductoById } from '../controllers/productos.controller';

const router = Router();

router.get('/productos', getProductos);

router.post('/productos', createProducto );

router.put('/productos/update/:id', updateProductoById );


router.put('/productos/delete/:id', deleteProductoById );




export default router;
