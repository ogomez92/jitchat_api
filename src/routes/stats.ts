import { Router, Request, Response, NextFunction } from "express";
import UserService from "../services/user_service";

const router = Router();

router.get("/stats", (req: Request, res: Response, next: NextFunction) => {
  try {
    const usersOnline = UserService.getOnlineUsers();
    const totalUsers = UserService.getTotalUsers();

    res.status(200).send(`users online: ${usersOnline}
    total users: ${totalUsers}
    `);
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
