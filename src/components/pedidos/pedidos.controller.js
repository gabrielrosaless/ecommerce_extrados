import {getConnection , sql, queries } from '../../database';
import ErrorHandler from '../../utils/errorHandler';


export const createPedido = async (req, res, next) => {

    const { productos, fecha, total } = req.body;

    if(productos==null || fecha == null || total == null){
         return next(new ErrorHandler('Bad request. Faltan datos para el pedido.', 400));
    }
    
    if (req.user.rol == 2){ //rol usuario
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('fecha', sql.DateTime, fecha)
                .input('total', sql.Float,total)
                .query(queries.insertPedido);
            
            for (let i = 0; i < productos.length; i++) {
                // const element = array[i];
                await pool.request()
                .input('idProducto',sql.Int, productos[i].idProducto)
                .input('idPedido',sql.Int, result.recordset[0].id)
                .input('cantidad',sql.Int, productos[i].cantidad)
                .query(queries.insertDetallePedido);
            }

            res.json({ productos, fecha, total });
            
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
    else{
        return next(new ErrorHandler('El usuario es admin. No puede tomar pedidos.', 400));
    }
}


export const getPedidos = async (req,res,next) => {

    if (req.user.rol == 1){ //rol admin
        try {
            const pool = await getConnection()
            const result = await pool.request()
            .input('usuario',sql.VarChar, req.user.usuario)
            .query(queries.getPedidosXUsuario); 
            res.json(result.recordset);
    
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
}