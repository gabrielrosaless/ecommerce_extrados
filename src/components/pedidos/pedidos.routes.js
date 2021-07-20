import {Router} from 'express';
import { createPedido, deletePedidoById, getPedidos } from './pedidos.controller';
import verifyToken  from '../usuarios/validate_token';

const router = Router();

router.post('/create', verifyToken, createPedido); // creo un pedido

router.get('/getPedidos', verifyToken, getPedidos) //obtiene los pedidos, 
//                                     //si es admin obtiene todos, si es usuario obtiene solo los suyos

router.put('/delete/:id', verifyToken, deletePedidoById ); //dar de baja un pedido



export default router;
