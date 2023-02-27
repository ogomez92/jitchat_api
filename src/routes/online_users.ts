import { Router, Request, Response, NextFunction } from "express";
import UserService from "../services/user_service";

const router = Router();

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
