
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


const validateUsuario = async (req,res,usuario) => {

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





export const loginUsuario = async (req, res) => {
        
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
            "rol": contraseña
        }

        // create token
        const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: config.tokenLife})
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: config.refreshTokenLife})
    
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