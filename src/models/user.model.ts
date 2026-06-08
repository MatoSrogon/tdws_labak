import crypto from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { promisify } from "util";
import pool from "../data/db";

const scrypt = promisify(crypto.scrypt);

type UserRow = RowDataPacket & {
  user_id: number;
  email: string;
  password: string;
  isAdmin: number;
};

class User {
  user_id?: number;
  email!: string;
  password!: string;
  name!: string;
  isAdmin!: number;

  constructor(
    data: {
      email: string;
      password: string;
      name: string;
      isAdmin?: number;
    },
    user_id?: number,
  ) {
    this.user_id = user_id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.isAdmin = data.isAdmin || 0;
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const [salt, key] = hashedPassword.split(":");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return key === derivedKey.toString("hex");
  }

  async save(): Promise<void> {
    if (this.user_id) {
      await pool.query<ResultSetHeader>(
        `UPDATE users SET email = ?, password = ?, name = ?, isAdmin = ? WHERE user_id = ?`,
        [this.email, this.password, this.name, this.isAdmin, this.user_id],
      );
    } else {
      const hashedPassword = await User.hashPassword(this.password);
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)`,
        [this.email, this.name, hashedPassword, this.isAdmin],
      );
      this.user_id = result.insertId;
      this.password = hashedPassword;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT user_id, name, email, password,isAdmin FROM users WHERE email = ?`,
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new User(
      {
        email: row.email,
        password: row.password,
        name: row.name,
        isAdmin: row.isAdmin,
      },
      row.user_id,
    );
  }

  static async findAll(search?: string): Promise<User[]> {
    let query = `SELECT user_id, name, email, password, isAdmin FROM users`;
    const params: any[] = [];

    if (search) {
      query += ` WHERE name LIKE ? OR email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query<UserRow[]>(query, params);

    return rows.map(
      (row) =>
        new User(
          {
            email: row.email,
            password: row.password,
            name: row.name,
            isAdmin: row.isAdmin,
          },
          row.user_id,
        ),
    );
  }

  static async findById(userId: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT user_id, name, email, password, isAdmin FROM users WHERE user_id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new User(
      {
        email: row.email,
        password: row.password,
        name: row.name,
        isAdmin: row.isAdmin,
      },
      row.user_id,
    );
  }

  static async delete(userId: number): Promise<void> {
    await pool.query<ResultSetHeader>(`DELETE FROM users WHERE user_id = ?`, [
      userId,
    ]);
  }
}

export default User;
