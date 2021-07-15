const ErrorHandler = require('./errorHandler');


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    
    
    // err.message = err.message || 'Internal Server Error';
    // Separlo la logica de error de desarrollo y produccion, nunca voy a entrar a produccion pero me sirve para aprender.
    if (process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        }) 
    }

    if (process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}
        error.message = err.message

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
    

    // res.status(err.statusCode).json({
    //     success: false,
    //     error: err.stack
    // });
}