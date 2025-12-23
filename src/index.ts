import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth.route";
import memberRoutes from "./routes/member.route";
import workspaceRoutes from "./routes/workspace.route";
import channelRoutes from "./routes/channel.route";
import messageRoutes from "./routes/message.route";
import reactionRoutes from "./routes/reaction.route";
import conversationRoutes from "./routes/conversation.route";
import adminRoutes from "./routes/admin.route";

dotenv.config();
connectDB();

const app = express();
morgan.token("statusColor", (req: any, res: any) => {
    const status = res.statusCode;
    if (status >= 500) return chalk.red(status);
    if (status >= 400) return chalk.yellow(status);
    if (status >= 300) return chalk.cyan(status);
    if (status >= 200) return chalk.green(status);
    return chalk.white(status);
});
app.use(
    morgan((tokens, req, res) => {
        return [
            chalk.red("Jash Gusani :-"),
            chalk.magenta(tokens.method(req, res)),
            chalk.blue(tokens.url(req, res)),
            tokens.statusColor(req, res),
            chalk.gray(tokens["response-time"](req, res) + "ms"),
        ].join(" ");
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000","https://quickcollab-ten.vercel.app"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT, () =>
    console.log(`✅ Server running on port ${process.env.PORT}`)
);
export default app;