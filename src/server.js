import express from "express";
import morgan from "morgan";

const app = express();
const logger = morgan("dev");

const PORT = 4000;

const listeningServer = () =>
  console.log(`Success listening at http://localhost:${PORT}`);

const home = (req, res) => res.send("<h1>home</h1>");
const login = (req, res) => res.send("login");

app.use(logger);
app.get("/", home);
app.get("/login", login);

app.listen(PORT, listeningServer);
