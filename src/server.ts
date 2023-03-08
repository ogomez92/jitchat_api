import InvitationController from "./services/invitation_controller";

export const PORT = 3456;

import app from "./app";
import UserService from "./services/user_service";
app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
  setInterval(() => InvitationController.update(), 500);
  setInterval(() => UserService.clearBlockedUsers(), 1800000);
});
