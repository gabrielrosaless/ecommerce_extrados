const jwt = require('jsonwebtoken');
import ErrorHandler from '../../utils/errorHandler';


const verifyToken = (req, res, next) => {
    const token = req.header('authorize');
    if (!token) return res.status(401).json({ error: true, mensaje: 'Acceso denegado' })

    try {
        const verificar = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verificar
        
        next() //continuamos
    } catch (error) {
        return next(new ErrorHandler('El token no es válido', 400));
    }
}

export default verifyToken;