import {Router} from 'express';
import { registerUsuario, login, refreshToken, updateRol, logout, changePassword } from './usuarios.controller';
import verifyToken from './validate_token';


const router = Router();

router.post('/register', registerUsuario);

router.post('/login', login);

// router.post('/logout', verifyToken, logout);

router.post('/token', verifyToken, refreshToken);

router.put('/changePassword',verifyToken, changePassword);

router.put('/updateRol/:id',verifyToken, updateRol);

export default router;
