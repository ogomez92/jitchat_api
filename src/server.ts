import InvitationController from './services/invitation_controller';

export const PORT = 3456;

import app from './app';
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
    setInterval(() => InvitationController.update(), 1000)
});
