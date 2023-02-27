import { Router, Request, Response, NextFunction } from "express";
import UserService from "../services/user_service";
import User from "../interfaces/user";

const router = Router();

router.post("/newuser", async (req: Request, res: Response) => {
  try {
    const user: User = await UserService.addUserWithRequest(req);

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
