const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('authorize');
    if (!token) return res.status(401).json({ error: true, mensaje: 'Acceso denegado' })

    try {
        const verificar = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verificar
        next() //continuamos
    } catch (error) {
        res.status(400).json({error: true, mensaje: 'El token no es válido'})
    }
}




export default verifyToken;