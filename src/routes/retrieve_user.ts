import { Router, Request, Response, NextFunction } from 'express';
import EndpointError from "..//enums/endpoint_error";
import UserService from "../services/user_service";
import User from "../interfaces/user";

const router = Router();

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

export default router;
