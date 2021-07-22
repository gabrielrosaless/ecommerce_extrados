import {getConnection , sql, queries } from '../../database';
import ErrorHandler from '../../utils/errorHandler';
const jwt = require('jsonwebtoken');

const calcularTotal = async (productos) => {

    const pool = await getConnection();
    let total = 0;
    for (let i = 0; i < productos.length; i++) {
        // Busco el precio del producto
        const result = await pool.request()
        .input('Id',sql.Int, productos[i].idProducto)
        .query(queries.getProductoByID);

        total += result.recordset[0].precio * productos[i].cantidad
        
    }

    return total
}


export const createPedido = async (req,res,next) => {

    const { productos } = req.body;

    if(productos==null){
        return next(new ErrorHandler('Bad request. Faltan datos para el pedido.', 400));
    }

    const total = await calcularTotal(productos);
    
    const pool = await getConnection();
    const transaction = await new sql.Transaction(pool)
    
    transaction.begin(async err => {
      try{
        const request = new sql.Request(transaction)
        const result = await request.input('usuario', sql.VarChar, req.user.usuario).query(queries.getUsuarioByUser);
        const result2 = await request.input('total', sql.Float,total)
                                    .input('idUsuario', sql.Int, result.recordset[0].Id)
                                    .input('isActive', sql.Bit, true)
                                    .query(queries.insertPedido);    
        
        for (let i = 0; i < productos.length; i++) {
            // Inserto detalle pedido
            const result3 = await transaction.request()
            .input('idProducto',sql.Int, productos[i].idProducto)
            .input('idPedido',sql.Int, result2.recordset[0].id)
            .input('cantidad',sql.Int, productos[i].cantidad)
            .query(queries.insertDetallePedido);
        }

        transaction.commit(err => {
            // ... error checks
            res.json({ productos, total });
            console.log("Transaction committed.")
        })
      }catch(err){
        transaction.rollback(tErr => tErr && next(new ErrorHandler('transaction rollback error',400)))
        //next('unknown error inside transaction = rollback')
        return next(new ErrorHandler(err.message, 400));
      }
    })

}


export const getPedidos = async (req,res,next) => {

    if (req.user.rol == 1){ //rol admin
        try {
            const pool = await getConnection()
            const result = await pool.request()
            .input('usuario',sql.VarChar, req.user.usuario)
            .query(queries.getPedidos); 
            res.json(result.recordset);
    
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
    else if (req.user.rol == 2){ //rol usuario

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


export const deletePedidoById = async (req,res,next) => {

    const{ id } = req.params;
    
    try {
        if (req.user.rol == 1){
            const pool = await getConnection();
            await pool.request()
                .input('id',sql.Int, id)
                .query(queries.deletePedidoById);
    
            res.json({
                success: true,
                mensaje: 'Pedido dado de baja.'
            })
        }
        else{
            return next(new ErrorHandler('El usuario no es admin. No puede dar de baja productos.', 403));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

}