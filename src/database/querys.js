export const queries =  {
    //Productos
    getAllProductos: 'SELECT * FROM Producto',
    addProducto: 'INSERT INTO Producto (nombre,descripcion,imagen,precio,marca,stock) VALUES (@nombre,@descripcion,@imagen,@precio,@marca,@stock)',
    updateProductoById: 
        'UPDATE Producto SET nombre = @nombre, descripcion = @descripcion, imagen = @imagen, precio = @precio, marca = @marca, stock = @stock WHERE Id = @Id',
    deleteProductoById: 'UPDATE Producto SET activo = 0 WHERE Id = @Id',


    //Usuarios
    registerUsuario: 'INSERT INTO Usuario (usuario,contraseña,rol) VALUES (@usuario,@contraseña,2)',
    findUsuarioByUser: 'SELECT Id,usuario,contraseña,rol FROM Usuario Where usuario = @usuario'


}
