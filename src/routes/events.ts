import { Router, Request, Response, NextFunction } from "express";
import UserService from "../services/user_service";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import EventType from "../enums/event_type";

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
    UserService.makeUserActive(userID);
  } catch (error) {
    // Close the connection, because that ID is neither online nor in storage.
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

export const sendEventToUser = (userID: string, eventName: EventType, data: string) => {
  const userResponseHandle: Response | undefined = userEventResponses.get(userID);

  if (!userResponseHandle) {
    UserService.disconnectUser(userID);
    return;
  }

  userResponseHandle.write(`event: ${eventName}\n`);
  userResponseHandle.write(`data: ${data}\n\n`);
}

export const closeConnectionForUser = (userID: string) => {
  const userResponseHandle: Response | undefined = userEventResponses.get(userID);

  if (!userResponseHandle) {
    return;
  }

  userResponseHandle.end();

  userEventResponses.delete(userID);

  UserService.disconnectUser(userID);
}

export default router;
