import "dotenv/config";
import express from "express";
import path from "path";
import publicRoutes from "./routes/public.route";
import questionListRoutes from "./routes/questionList.route";
import { initDB } from "./data/db";
import createSessionConfig from "./config/session";
import { checkAuthStatus } from "./middlewares/check-auth.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error-handler.middleware";
import answerRoutes from "./routes/answers.route";
import usersRoutes from "./routes/users.route";

const requiredEnv = ["SESSION_SECRET", "DB_PASSWORD"];

for (const item of requiredEnv) {
  if (process.env[item] === undefined) {
    console.log("env nie je definovany: ", item);
    /// metoda na ukoncenie kodu
  }
}

const app = express();
const port = process.env.PORT || 3000;


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("src/public"));


app.use(createSessionConfig());

app.use(checkAuthStatus);

app.use("/users", usersRoutes);

app.use("/", publicRoutes);
app.use("/", questionListRoutes);
app.use("/answers", answerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await initDB();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();