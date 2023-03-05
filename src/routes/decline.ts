import { Router, Request, Response, NextFunction } from "express";
import InvitationController from "../services/invitation_controller";

const router = Router();

router.get('/decline', (req: Request, res: Response, next: NextFunction) => {
  // expect invitation and user as parameters
  const { user, invitation } = req.query;
  
  InvitationController.declineInvitation(invitation as string, user as string)
  InvitationController.update();
});

export default router;
