import {getConnection , sql, queries } from '../../database';
import config from '../../config';
const jwt = require('jsonwebtoken');

// constraseña
const bcrypt = require('bcrypt');
//tokenList
const tokenList = {}


export const registerUsuario = async (req, res) => {
    
    const {usuario, contraseña} = req.body;
    
    if (usuario == null || contraseña == null){
        return res.status(400).json({error: 'Bad request. Por favor complete los campos.'});
    }

    const result = await validateUsuario(req,res,usuario);
    
    if (result){
        return res.status(400).json(
            {error: 'Usuario ya registrado'}
        ); 
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
            error: null,
            data: {usuario, password}
        });

    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
}


export const validateUsuario = async (req,res,usuario) => {

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
        res.status(500);
        res.send(error.message);
    }
}





export const login = async (req, res) => {
        
    // validaciones
    const { usuario, contraseña } = req.body;
    if (usuario == null || contraseña == null){
        return res.status(400).json({ error: 'Bad request. Por favor complete los campos.'});
    }     
    const result = await validateUsuario(req,res,usuario);

    if (result){
        const validPassword = await bcrypt.compare(req.body.contraseña, result.contraseña);
        if (!validPassword) return res.status(400).json({
            error: true,
            mensaje: 'Contraseña no valida!'
        });
        
        const user = {
            "usuario": usuario,
            "rol": result.rol
        }

        // create token
        const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: config.tokenLife});
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: config.refreshTokenLife});
    
        res.header('authorize', token).json({
            error: null,
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
        return res.status(400).json({
            error: true,
            mensaje: 'Usuario no encontrado.'
        });
    }
}


export const refreshToken = (req,res) => {
    // refresh the damn token
    const {usuario, rol ,refreshToken} = req.body
    
    // if refresh token exists
    if((tokenList[refreshToken] == usuario) && (refreshToken in tokenList)) {
        
        const user = {
            "usuario": usuario,
            "rol": rol
        }
        const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: config.tokenLife})

        const response = {
            "token": token,
        }

        res.status(200).json(response);    
    
    } else {
        res.status(404).send({
            error: true,
            mensaje: 'No se pudo refrescar el token.'
        });
    }
}



export const updateRol = async (req,res) => {
        
    const{ id } = req.params;
    const{ usuario } = req.body;

    try {
        
        const result = await validateUsuario(req,res,usuario);
        
        if(result && result.rol == 1){
            const pool = await getConnection();
            const respuesta = await pool.request()
                .input('id',sql.Int, id)
                .query(queries.updateRol);
            
            if (respuesta.rowsAffected > 0){
                res.json({
                    error: null,
                    mensaje: "Rol actualizado."
                });
            }
            else{
                return res.status(400).json({
                    error: true,
                    mensaje: 'El usuario al que desea cambiar el rol no existe.'
                });
            }   
        }
        else{
            return res.status(400).json({
                error: true,
                mensaje: 'Acción no autorizada.'
            });
        }
    } catch (error) {
        res.status(400);
        res.send(error.message);
    }
}

export const logout = async (req,res) => {
    
    const authHeader = req.headers["authorize"];
    // console.log(authHeader);
    // const user = {
    //     "usuario": "",
    //     "rol": ""
    // };
    //const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: config.tokenLife});
    // console.log(authHeader);
    // jwt.sign(authHeader, "", { expiresIn: 1 } , (logout, err) => {
    //     if (logout) {
    //         res.send({mensaje: 'Logout exitoso' });
    //     } else {
    //         res.send({error: true, mensaje:'Error en el logout.'});
    //     }
    // });
}



export const changePassword = async (req,res) => {

    const { contraseña, contraseñaNueva, id, token } = req.body;
    const usuario = req.user.usuario
    try {
        const result = await validateUsuario(req,res,usuario);
        
        if (result){
            
            const validate = await validatePassword(req,res,usuario,contraseña);
            
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
                            error: null,
                            mensaje: "Contraseña actualizada."
                        });
                    }
                    else{
                        return res.status(400).json({
                            error: true,
                            mensaje: 'Error al cambiar la contraseña.'
                    });
                }
            }
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
}



const validatePassword = async (req,res,usuario,contraseña) => {

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
        res.status(500);
        res.send(error.message);
    }
}