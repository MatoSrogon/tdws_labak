import MySQLStoreFactory from "express-mysql-session";
import session from "express-session";

const MySQLStore = MySQLStoreFactory(session);

const craeteSessionStore = () => {
  const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    port: 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_SESSION_NAME || "session_data", //DB has to exists
  });
  return sessionStore;
};

const createSessionConfig = () => {
  return session({
    secret: process.env.SESSION_SECRET || "superSecret",
    resave: false,
    saveUninitialized: false,
    store: craeteSessionStore(),
  });
};

export default createSessionConfig;
