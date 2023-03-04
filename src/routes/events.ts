import { Router, Request, Response, NextFunction } from "express";
import { PORT } from '../server';
import UserService from "../services/user_service";
import UserStatus from "../enums/user_status";

const router = Router();

const userEventResponses: Map<string, Response> = new Map();

router.get('/events/:userID', (req, res) => {
  const { userID } = req.params;
  console.log(`I am registering events for ${userID}`)

  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();
  try {
    UserService.setStatus(userID, UserStatus.WAITING)
  } catch (error) {
    // The user is not registered as online, close the connection.
    res.end();
  }

  userEventResponses.set(userID, res);

  // If the connection is closed or dropped for any reason, remove from map

  req.on('close', () => {
    console.log(`${userID} connection dropped`)
    UserService.disconnectUser(userID);
    userEventResponses.delete(userID);
  });

  req.on('error', (err) => {
    console.log(`${userID} connection error: ${err}`)
    UserService.disconnectUser(userID);
    userEventResponses.delete(userID);
  });
});

export const sendEventToUser = (userID: string, eventName: string, data: string) => {
  const userResponseHandle: Response | undefined = userEventResponses.get(userID);

  if (!userResponseHandle) {
    console.error(`The specified user does not have a response set.`)
    UserService.disconnectUser(userID);
    return;
  }

  userResponseHandle.write(`event: ${eventName}\n`);
  userResponseHandle.write(`data: ${data}\n\n`);
}

export default router;
