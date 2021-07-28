import {getConnection , sql, queries } from '../../database';
import config from '../../config';
const jwt = require('jsonwebtoken');
import ErrorHandler from '../../utils/errorHandler';
import findTokenInDB from '../../utils/token_logout';


// constraseña
const bcrypt = require('bcrypt');
//tokenList
const tokenList = {}

export const registerUsuario = async (req,res,next) => {
    
    const {usuario, contraseña} = req.body;
    
    if (usuario == null || contraseña == null || usuario == "" || contraseña == ""){
        return next(new ErrorHandler('Por favor complete todos los campos.', 400));
    }

    const result = await validateUsuario(req,res,next,usuario);
    
    if (result){
        return next(new ErrorHandler('Usuario ya registrado.', 403));
    };

    //hash contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.contraseña, salt);

    try {
        const pool = await getConnection();
        await pool.request()
            .input('usuario',sql.VarChar, usuario)
            .input('contraseña',sql.VarChar,password)
            .query(queries.registerUsuario);

        res.json({
            success: true,
            data: {usuario, password}
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}


export const validateUsuario = async (req,res,next,usuario) => {

    try {

        const pool = await getConnection();
        const user = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .query(queries.findUsuarioByUser);
        
        if (user.rowsAffected > 0) {
            return user.recordset[0];
        }else{
            return user.recordset[0];
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}





export const login = async (req, res,next) => {
        
    // validaciones
    const { usuario, contraseña } = req.body;
    
    if (usuario == null || contraseña == null){
        return next(new ErrorHandler('Bad request. Por favor complete los campos.', 400));
    }     
    
    const result = await validateUsuario(req,res,next,usuario);

    if (result){
        const validPassword = await bcrypt.compare(req.body.contraseña, result.contraseña);
        if (!validPassword) return next(new ErrorHandler('Usuario y/o contraseña incorrecto', 401));
        
        const user = {
            "usuario": usuario,
            "rol": result.rol
        }

        // create token
        const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: config.tokenLife});
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: config.refreshTokenLife});
    
        res.header('authorize', token).json({
            success: true,
            status: "Logeo exitoso.",
            token: token,
            refreshToken: refreshToken
        })
        tokenList[refreshToken] = usuario
        // res.json({token: 'JWT ' + token, refreshToken: refreshToken}) 
        // res.json({
        //     error: null,
        //     mensaje: 'Login exitoso! Bienvenido!',
        //     authorize: token
        // });
    }
    else{
        return next(new ErrorHandler('Usuario no encontrado.', 400));
    }
}


export const refreshToken = async (req,res,next) => {
    
    const rol = req.user.rol;
    const usuario = req.user.usuario;

    const authHeader = req.headers["authorize"];
    const bool = await findTokenInDB(req,res,next,authHeader);

    if (!bool){

        // refresh the damn token
        const {refreshToken} = req.body;

        const refreshValid = await findTokenInDB(req,res,next,refreshToken);

        if (!refreshValid) {
            // if refresh token exists
            if((tokenList[refreshToken] == usuario) && (refreshToken in tokenList)) {
                
                const user = {
                    "usuario": usuario,
                    "rol": rol
                }
                const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: config.tokenLife})

                const response = {
                    success: true,
                    "token": token,
                }

                res.status(200).json(response);    
            
            } 
            else {
                return next(new ErrorHandler('No se pudo refrescar el token.', 400));
            }
        }
        else{
            return next(new ErrorHandler('El refresh token es inutilizable.', 400));
        }
    }
    else{
        return next(new ErrorHandler('El token es inutilizable.', 400));
    }
    
}



export const updateRol = async (req,res,next) => {
        
    const{ id } = req.params;

    const authHeader = req.headers["authorize"];
    const bool = await findTokenInDB(req,res,next,authHeader);

    if (!bool){
        try {
            const result = await validateUsuario(req,res,next,req.user.usuario);

            if(result && result.rol == 1){
                const pool = await getConnection();
                const respuesta = await pool.request()
                    .input('id',sql.Int, id)
                    .query(queries.updateRol);
                
                if (respuesta.rowsAffected > 0){
                    res.json({
                        success: true,
                        mensaje: "Rol actualizado."
                    });
                }
                else{
                    return next(new ErrorHandler('El usuario al que desea cambiar el rol no existe.', 400));
                }   
            }
            else{
                return next(new ErrorHandler('Acción no autorizada.', 403));
            }
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
    else{
        return next(new ErrorHandler('El token es inutilizable.', 400));
    }
    
}

export const logout = async (req,res,next) => {
    
    const authHeader = req.headers["authorize"];
    
    const { refreshTok } = req.body;

    const bool = await findTokenInDB(req,res,next,authHeader);
    
    if (!bool){
        const pool = await getConnection();
        const transaction = await new sql.Transaction(pool);
    
        transaction.begin(async err => {
          try{
            const request = new sql.Request(transaction)
            
            const result = await request.input('token', sql.VarChar,authHeader).query(queries.insertToken);    
            
            const result2 = await request.input('reftoken', sql.VarChar,refreshTok).query(queries.insertRefreshToken);    
            
            transaction.commit(err => {
                // ... error checks
                // res.json(result2.recordset);
                res.json({
                    result,
                    result2
                })
                console.log("Transaction committed.")
            })
          }
          catch(err){
            transaction.rollback(tErr => tErr && next(new ErrorHandler('transaction rollback error',400)))
            return next(new ErrorHandler(err.message, 400));
            
          }
        })
    }
    else{
        return next(new ErrorHandler('El token es inutilizable.', 400));
    }
}






export const changePassword = async (req,res,next) => {

    const { contraseña, contraseñaNueva, id } = req.body;
    const usuario = req.user.usuario;

    const authHeader = req.headers["authorize"];
    const bool = await findTokenInDB(req,res,next,authHeader);

    if (!bool){
        try {
            const result = await validateUsuario(req,res,next,usuario);
           
            if (result && result.Id == id){
                
                const validate = await validatePassword(req,res,next,usuario,contraseña);
                
                if (validate){
                     //hash contraseña
                    const salt = await bcrypt.genSalt(10);
                    const password = await bcrypt.hash(contraseñaNueva, salt);
                    
                    const pool = await getConnection();
                    const respuesta = await pool.request()
                        .input('id',sql.VarChar, id)
                        .input('contraseña',sql.VarChar, password)
                        .query(queries.updateContraseña);
                 
                        if (respuesta.rowsAffected > 0){
                            res.json({
                                success: true,
                                mensaje: "Contraseña actualizada."
                            });
                        }
                        else{
                            return next(new ErrorHandler('Error al actualizar la contraseña.', 400));
                    }
                }
                else{
                    return next(new ErrorHandler('Contraseña actual incorrecta.', 403));
                }
            }
            else{
                return next(new ErrorHandler('Error! Revise los datos.', 400));
            }
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
    else{
            return next(new ErrorHandler('El token es inutilizable.', 400));
    }
}



const validatePassword = async (req,res,next,usuario,contraseña) => {

    try {

        const pool = await getConnection();
        const user = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .query(queries.findUsuarioByUser);
        
        const isValid = await bcrypt.compare(contraseña, user.recordset[0].contraseña);
        if (isValid){
            return true;
        }
        else{
            return false;
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}