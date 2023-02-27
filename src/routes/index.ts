import { Router, Request, Response, NextFunction } from 'express';
import EndpointError from "..//enums/endpoint_error";
import UserService from "../services/user_service";
import User from "../interfaces/user";
import StorageManager from "../services/storage_manager";

const router = Router();
export const storageManager: StorageManager = new StorageManager();

router.get("/retrieveuser", (req: Request, res: Response) => {
    try {
      const { id } = req.query;
  
      if (!id) {
        return res.status(400).json({ message: EndpointError.USER_NOT_SPECIFIED });
      }
  
      const user = UserService.getUserWithUUID(id as string);
  
      return res.status(200).json({ ...user });
    } catch (error) {
      return res.status(500).json({ error, message:EndpointError.USER_RETRIEVAL });
    }
  });
  
  router.post("/newuser", async (req: Request, res: Response) => {
    try {
      const user: User = await UserService.addUserWithRequest(req);
  
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  });
  
  router.get('/onlineusers', (req: Request, res: Response, next: NextFunction) => {
    try {
      const usersOnline = UserService.getOnlineUsers();
  
      res.status(200).json(usersOnline);
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  
export default router;
