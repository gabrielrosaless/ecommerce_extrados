
import {getConnection , sql, queries } from '../../database';


export const getProductos = async (req,res) => {

    try {
        const pool = await getConnection(); //llamo a la bd
        const result = await pool.request().query(queries.getAllProductos); // ejecuto la consulta
        res.json(result.recordset);

    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
};

export const getProductoById = async (req,res) => {

    const{ id } = req.params;

    try {
        const pool = await getConnection(); 
        const result = await pool.request()
        .input('id',sql.Int, id)
        .query(queries.getProductoByID);
         
        res.json(result.recordset);
    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
}


export const createProducto = async (req, res) => {
    
    const {nombre, descripcion, imagen, precio, marca} = req.body;
    let {stock} = req.body;
    
    if(nombre==null || descripcion == null || precio == null || marca == null){
        return res.status(400).json({mensaje: 'Bad request. Por favor llena todo los campos.'})
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
            return res.status(400).json({mensaje: 'El usuario no es admin. No puede agregar productos.'})
        }
        
    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
}


export const updateProductoById = async (req,res) => {

    const {nombre, descripcion, imagen, precio, marca, stock} = req.body;
    
    const{ id } = req.params;

    if(nombre==null || descripcion == null || precio == null || marca == null || stock== null){
        return res.status(400).json({mensaje: 'Bad request. Por favor llena todo los campos.'})
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
            return res.status(400).json({mensaje: 'El usuario no es admin. No puede editar productos.'});
        }
    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
    

};


export const deleteProductoById = async (req,res) => {

    const{ id } = req.params;

    try {
        if (req.user.rol == 1){
            const pool = await getConnection();
            await pool.request()
                .input('id',sql.Int, id)
                .query(queries.deleteProductoById);
    
            res.json("Producto dado de baja.")
        }
        else{
            return res.status(400).json({mensaje: 'El usuario no es admin. No puede dar de baja productos.'});
        }
        
    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
};
