import {Router} from 'express';
import { registerUsuario, loginUsuario, refreshToken } from './usuarios.controller';


const router = Router();

router.post('/register', registerUsuario);

router.post('/login', loginUsuario);


router.post('/token', refreshToken);

export default router;
