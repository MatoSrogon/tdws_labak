import mysql, { RowDataPacket } from "mysql2/promise";
import createSessionConfig from "../config/session";

const adminDbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  //password: "Uniza2024#",
};

const appDbConfig = {
  ...adminDbConfig,
  database: process.env.DB_NAME || "srogon_db1",
};

const pool = mysql.createPool(appDbConfig);

type CountRow = RowDataPacket & { count: number };

const initDB = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS otazka (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title varchar(255),
        description varchar(255),
        author_name varchar(25),
        votes int,
        views int,
        created_at timestamp default current_timestamp);`,

    `CREATE TABLE IF NOT EXISTS odpoved (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        \`text\` TEXT,
        author_name VARCHAR(25),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES Otazka(id) ON DELETE CASCADE);`,
  ];

  const inserts = [
    {
      table: "otazka",
      insert: `INSERT INTO otazka (title, description, author_name, votes, views) VALUES
            ('Why does my code work only when I watch it?', 'When I stare at it, it works. When I leave, it crashes.', 'debug_wizard', 42, 1337),
            ('Is it normal to google my own error messages?', 'Asking for a friend (the friend is me).', 'sleepy_dev', 27, 980),
            ('How to center a div without sacrificing a goat?', 'CSS seems to require ancient rituals.', 'frontend_sufferer', 55, 2001),
            ('Why does adding one print() fix everything?', 'Is print debugging actually magic?', 'console.log', 31, 1500),
            ('Can I deploy on Friday or is that illegal?', 'My manager says yes. My soul says no.', 'weekend_guardian', 64, 2200),
            ('Why does my program compile but still hate me?', 'No errors, no warnings, just emotional damage.', 'confused_coder', 38, 1200),
            ('How many tabs vs spaces debates before a project dies?', 'Our team meeting is now 3 hours long.', 'indent_warrior', 46, 1750), 
            ('Why does my fix create two new bugs?', 'I fix one thing and suddenly the whole app becomes haunted.', 'bug_collector', 29, 990);`,
    },
    {
      table: "odpoved",
      insert: `INSERT INTO odpoved (question_id, text, author_name) VALUES
            (1, 'Your code is shy. Try encouraging it with comments.', 'old_timer'),
            (1, 'Classic observer effect. Happens in programming too.', 'quantum_dev'),
            (2, 'Yes. Step 2 is finding a 2012 Stack Overflow post that saves your life.', 'stack_hero'),
            (2, 'If you are not googling errors, are you even coding?', 'realist42'),
            (3, 'Use flexbox. Goats are optional now.', 'css_wizard'),
            (3, 'margin: auto; pray();', 'minimalist_dev'),
            (4, 'print() scares the bugs away.', 'bug_exorcist'),
            (4, 'It changes timing. Also: magic.', 'mysterious_coder'),
            (5, 'You can deploy Friday. Just update your resume first.', 'career_advisor'),
            (5, 'Allowed, but only once.', 'production_survivor');
            (6, 'Compilation success only means the compiler gave up.', 'senior_dev'),
            (6, 'Working as intended. The hate comes at runtime.', 'runtime_philosopher'),
            (7, 'Exactly one. After that the team splits into two startups.', 'startup_guru'),
            (7, 'Use spaces. Or tabs. Just never mix them unless you enjoy chaos.', 'peacekeeper'),
            (8, 'That is called feature multiplication.', 'product_manager'),
            (8, 'You didn’t create bugs. You discovered undocumented features.', 'optimistic_dev');`,
    },
  ];

  const adminConnection = await mysql.createConnection(adminDbConfig);
  await adminConnection.query("CREATE DATABASE IF NOT EXISTS srogon_db");
  await adminConnection.query("CREATE DATABASE IF NOT EXISTS session_data");
  await adminConnection.end();

  for (const query of tables) {
    await pool.query(query);
  }

  for (const query of inserts) {
    const [rows] = await pool.query<CountRow[]>(
      `select count(*) as count from ${query.table}`
    );
    if (rows[0].count === 0) {
      await pool.query(query.insert);
    }
  }

  createSessionConfig();

  const [columns] = await pool.query<any[]>(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'srogon_db1' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'isAdmin'",
  );
  if (columns.length === 0) {
    await pool.query("ALTER TABLE users ADD isAdmin integer default 0;");
  }

  const [users] = await pool.query<any[]>("select * from users");

  if (users.length > 0) {
    //console.log(users);
    await pool.query("update users set isAdmin = 1 where user_id = ?", [
      users[0].user_id,
    ]);
  }

  // const [users] = await pool.query<UserRow[]>("select user_id from users");
  // if (users.length > 0) {
  //   await pool.query("update users set isAdmin = 1 where user_id = ?", [
  //     users[0].user_id,
  //   ]);
  // }
};

export { initDB };
export default pool;
