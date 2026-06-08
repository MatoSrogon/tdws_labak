import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../data/db";

type QuestionRow = RowDataPacket & {
  id: number;
  title: string;
  description: string;
  author_name: string;
  votes: number;
  views: number;
  created_at: Date;
};

class Question {
  id?: number;
  title: string;
  description: string;
  author_name: string;
  votes: number;
  views: number;
  created_at?: Date;
  user_id: number;
  imageLocation?: string | null;
  constructor(
    title: string,
    description: string,
    author_name: string,
    user_id: number,
    votes: number = 0,
    views: number = 0,
    id?: number,
    created_at?: Date,
    imageLocation?: string | null
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.author_name = author_name;
    this.votes = votes;
    this.views = views;
    this.created_at = created_at;
    this.user_id = user_id;
    this.imageLocation = imageLocation ?? null;
  }

  static async findAll(): Promise<QuestionRow[]> {
    const [rows] = await pool.query<QuestionRow[]>(
      `SELECT q.id, q.title, q.description, COALESCE(u.name, q.author_name) as author_name, q.votes, q.views, q.created_at, q.user_id, q.imageLocation
       FROM Otazka q
       LEFT JOIN users u ON q.user_id = u.user_id
       ORDER BY q.created_at DESC`,
    );

    return rows;
  }

  static async findById(id: number): Promise<Question | null> {
    const [rows] = await pool.query<QuestionRow[]>(
      `SELECT q.id, q.title, q.description, COALESCE(u.name, q.author_name) as author_name, q.votes, q.views, q.created_at, q.user_id, q.imageLocation
       FROM Otazka q
       LEFT JOIN users u ON q.user_id = u.user_id
       WHERE q.id = ?`,
      [id],
    );

    

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return new Question(
      row.title,
      row.description,
      row.author_name,
      row.user_id,
      row.votes,
      row.views,
      row.id,
      row.created_at,
      row.imageLocation
    );
  }

  merge(data: Partial<Omit<Question, "id" | "merge" | "save">>) {
    Object.assign(this, data);
  }

  async save(): Promise<void> {
    if (this.id) {
      await pool.query<ResultSetHeader>(
        `UPDATE Otazka
         SET title = ?, description = ?, author_name = ?, votes = ?, views = ?, imageLocation = ?
         WHERE id = ?`,
        [
          this.title,
          this.description,
          this.author_name,
          this.votes,
          this.views,
          this.imageLocation,
          this.id,
        ],
      );
    } else {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO Otazka (title, description, author_name, votes, views, user_id, imageLocation)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          this.title,
          this.description,
          this.author_name,
          this.votes,
          this.views,
          this.user_id,
          this.imageLocation,
        ],
      );

      this.id = result.insertId;
    }
  }

  static async incrementViews(id: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE Otazka SET views = views + 1 WHERE id = ?`,
      [id],
    );
  }
  async delete(): Promise<void> {
    if (!this.id) {
      throw new Error("Cannot delete question without ID");
    }

    await pool.query<ResultSetHeader>(
      `DELETE FROM Otazka WHERE id = ?`,
      [this.id]
    );
  }
}

export default Question;