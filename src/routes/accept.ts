import { Router, Request, Response, NextFunction } from "express";
import InvitationController from "../services/invitation_controller";
import EndpointError from "../enums/endpoint_error";

const router = Router();

router.get('/accept', (req: Request, res: Response, next: NextFunction) => {
  const { user, invitation } = req.query;
  try {
    InvitationController.acceptInvitation(invitation as string, user as string)

    res.status(200).send('ok');
  } catch (error) {
    res.status(400).send(EndpointError.USER_NOT_FOUND)
  }
});

export default router;
