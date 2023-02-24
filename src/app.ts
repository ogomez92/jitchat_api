import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import EndpointError from "./enums/endpoint_error";
import UserService from "./services/user_service";
import User from "./interfaces/user";
import morgan from "morgan";
import StorageManager from "./services/storage_manager";

const app = express();
export const storageManager: StorageManager = new StorageManager();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("tiny"));

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
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

app.post("/newuser", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = await UserService.addUserWithRequest(req);

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

app.get('/onlineusers', (req: Request, res: Response, next: NextFunction) => {
  try {
    const usersOnline = UserService.getOnlineUsersByLanguage();

    const usersOnlineObject = Object.fromEntries(usersOnline);

    res.status(200).json(usersOnlineObject);
  } catch (error) {
    next(error);
  }
});

export default app;
