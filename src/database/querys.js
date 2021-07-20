export const queries =  {
    //Productos
    getAllProductos: 'SELECT * FROM Producto',
    addProducto: 'INSERT INTO Producto (nombre,descripcion,imagen,precio,marca,stock) VALUES (@nombre,@descripcion,@imagen,@precio,@marca,@stock)',
    updateProductoById: 
        'UPDATE Producto SET nombre = @nombre, descripcion = @descripcion, imagen = @imagen, precio = @precio, marca = @marca, stock = @stock WHERE Id = @Id',
    deleteProductoById: 'UPDATE Producto SET activo = 0 WHERE Id = @Id',
    getProductoByID: 'SELECT Id,nombre,descripcion,imagen,precio,marca,stock FROM Producto WHERE Id = @Id',


    //Usuarios
    registerUsuario: 'INSERT INTO Usuario (usuario,contraseña,rol) VALUES (@usuario,@contraseña,2)',
    findUsuarioByUser: 'SELECT Id,usuario,contraseña,rol FROM Usuario Where usuario = @usuario',
    updateRol: 'UPDATE Usuario SET rol = 1 WHERE Id = @Id',
    updateContraseña: 'UPDATE Usuario SET contraseña = @contraseña WHERE Id = @Id',
    getUsuarioByUser: 'SELECT Id,usuario From Usuario WHERE usuario = @usuario',


    //Pedidos
    insertPedido: 'INSERT INTO Pedido (fecha,total,idUsuario,isActive) VALUES (CONVERT(VARCHAR,@fecha,103),@total,@idUsuario,@isActive); SELECT SCOPE_IDENTITY() AS id;',
    insertDetallePedido: 'INSERT INTO DetallePedido (IdPedido, IdProducto, cantidad) VALUES (@IdPedido,@IdProducto,@cantidad)',
    getPedidosXUsuario: 'select p.ID,p.idUsuario,p.fecha,p.total,dp.IdProducto, pro.nombre,pro.descripcion,pro.precio,dp.cantidad' +
                    ' FROM Pedido p' + 
                    ' LEFT JOIN DetallePedido dp on dp.IdPedido = p.Id' + 
                    ' LEFT JOIN Producto pro on pro.Id = dp.IdProducto' +  
                    ' LEFT JOIN Usuario u on u.Id = p.idUsuario'+  
                    ' WHERE u.usuario = @usuario' +
                    ' ORDER BY p.fecha desc',
    deletePedidoById: 'UPDATE Pedido SET isActive = 0 WHERE Id = @Id'
}
