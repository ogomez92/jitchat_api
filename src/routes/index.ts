import { Router, Request, Response, NextFunction } from 'express';
import retrieveUser from './retrieve_user';
import onlineUsers from './online_users';
import newUser from './new_user';

const router = Router();

router.use('/', retrieveUser);
router.use('/', onlineUsers);
router.use('/', newUser);

export default router;
