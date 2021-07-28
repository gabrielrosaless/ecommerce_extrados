
import {getConnection , sql, queries } from '../database';
import ErrorHandler from './errorHandler';

const findTokenInDB = async (req,res,next,token) => {
    try {

        const pool = await getConnection();
        const user = await pool.request()
            .input('token', sql.VarChar, token)
            .query(queries.findTokenInBlackList);

        if (user.recordset.length > 0) {
            return true;
        }else{
            return false;
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export default findTokenInDB;