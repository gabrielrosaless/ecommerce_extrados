
import {getConnection , sql, queries } from '../../database';
import ErrorHandler from '../../utils/errorHandler';

export const getProductos = async (req,res,next) => {

    try {
        const pool = await getConnection(); //llamo a la bd
        const result = await pool.request().query(queries.getAllProductos); // ejecuto la consulta
        res.json(result.recordset);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

export const getProductoById = async (req,res,next) => {

    const{ id } = req.params;

    try {
        const pool = await getConnection(); 
        const result = await pool.request()
        .input('id',sql.Int, id)
        .query(queries.getProductoByID);
         
        res.json(result.recordset);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}


export const createProducto = async (req, res,next) => {
    
    const {nombre, descripcion, imagen, precio, marca} = req.body;
    let {stock} = req.body;
    
    if(nombre==null || nombre == "" || descripcion == null || descripcion == "" || precio == "" || precio == null || marca == "" || marca == null){
        return next(new ErrorHandler('Bad request. Por favor llena todo los campos.', 400));
    }

    if (stock == null) stock = 0;

    try {
        if (req.user.rol == 1){
            const pool = await getConnection();
            await pool.request()
                .input('nombre',sql.VarChar, nombre)
                .input('descripcion',sql.VarChar,descripcion)
                .input('imagen',sql.VarChar,imagen)
                .input('marca',sql.VarChar, marca)
                .input('stock',sql.Int, stock)
                .input('precio',sql.Float, precio)
                .query(queries.addProducto);
    
            res.json({nombre, descripcion, imagen, precio, marca});
        }
        else{
            return next(new ErrorHandler('El usuario no es admin. No puede agregar productos.', 403));   
        }
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}


export const updateProductoById = async (req,res,next) => {

    const {nombre, descripcion, imagen, precio, marca, stock} = req.body;
    
    const{ id } = req.params;

    if(nombre==null || descripcion == null || precio == null || marca == null || stock== null){
        return next(new ErrorHandler('Bad request. Por favor llena todo los campos.', 400));
    }

    try {
        
        if (req.user.rol == 1){
            const pool = await getConnection();
            await pool.request()
                .input('id',sql.Int, id)
                .input('nombre',sql.VarChar, nombre)
                .input('descripcion',sql.VarChar,descripcion)
                .input('imagen',sql.VarChar,imagen)
                .input('marca',sql.VarChar, marca)
                .input('stock',sql.Int, stock)
                .input('precio',sql.Float, precio)
                .query(queries.updateProductoById);
    
            res.json({nombre, descripcion, imagen, precio, marca});
        }
        else{
            return next(new ErrorHandler('El usuario no es admin. No puede editar productos.', 403));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
    

};


export const deleteProductoById = async (req,res,next) => {

    const{ id } = req.params;

    try {
        if (req.user.rol == 1){
            const pool = await getConnection();
            await pool.request()
                .input('id',sql.Int, id)
                .query(queries.deleteProductoById);
    
            res.json({
                success: true,
                mensaje: 'Producto dado de baja.'
            })
        }
        else{
            return next(new ErrorHandler('El usuario no es admin. No puede dar de baja productos.', 403));
        }
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};
