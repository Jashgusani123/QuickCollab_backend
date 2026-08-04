import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/database";
import routes from "./routes/routes";
import dns from "dns";
import { User } from "./models/user.model";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);

// --- Core middleware FIRST, so cookies/body exist for everything after ---
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://quickcollab-ten.vercel.app"],
    credentials: true,
  })
);

// --- Attach a display name per-request (does NOT block unauthenticated routes) ---
interface UserRequest extends Request {
  userName?: string;
}

app.use(async (req: UserRequest, res: Response, next: NextFunction) => {
  req.userName = "Guest";
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const currUser = await User.findById(decoded.id).select("name");
      req.userName = currUser?.name || "Guest";
    }
  } catch {
    // invalid/expired token — just log as Guest, don't block the request
  }
  next();
});

// --- Morgan logging ---
morgan.token("statusColor", (req: any, res: any) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return chalk.white(status);
});

morgan.token("user", (req: UserRequest) => req.userName || "Guest");

app.use(
  morgan((tokens, req, res) => {
    return [
      chalk.red(`${tokens.user(req, res)} :- `),
      chalk.magenta(tokens.method(req, res)),
      chalk.blue(tokens.url(req, res)),
      tokens.statusColor(req, res),
      chalk.gray(tokens["response-time"](req, res) + "ms"),
    ].join(" ");
  })
);

app.use("/api", routes);

// Apply `auth` per-route (in your routes file) wherever a route actually needs it,
// not globally here.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;