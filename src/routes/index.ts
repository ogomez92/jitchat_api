import { Router, Request, Response, NextFunction } from 'express';
import EndpointError from "..//enums/endpoint_error";
import UserService from "../services/user_service";
import User from "../interfaces/user";
import StorageManager from "../services/storage_manager";
import retrieveUser from './retrieve_user';
import onlineUsers from './online_users';
import newUser from './new_user';

const router = Router();
export const storageManager: StorageManager = new StorageManager();

router.use('/', retrieveUser);
router.use('/', onlineUsers);
router.use('/', newUser);

export default router;
