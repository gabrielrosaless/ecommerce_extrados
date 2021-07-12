export const queries =  {

    getAllProductos: "SELECT * FROM Producto",
    addProducto: 'INSERT INTO Producto (nombre,descripcion,imagen,precio,marca,stock) VALUES (@nombre,@descripcion,@imagen,@precio,@marca,@stock)',
    updateProductoById: 
        'UPDATE Producto SET nombre = @nombre, descripcion = @descripcion, imagen = @imagen, precio = @precio, marca = @marca, stock = @stock WHERE Id = @Id',
    deleteProductoById: "UPDATE Producto SET activo = 0 WHERE Id = @Id"
}