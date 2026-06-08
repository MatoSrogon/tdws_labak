import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import pool from "../data/db";

type AnswerDbRow = RowDataPacket & {
  id: number;
  question_id: number;
  user_id: number;
  text: string;
  created_at: Date;
};

class Answer {
  id?: number;
  question_id: number;
  user_id: number;
  text: string;
  created_at?: Date;

  constructor(
    question_id: number,
    user_id: number,
    text: string,
    id?: number,
    created_at?: Date
  ) {
    this.id = id;
    this.question_id = question_id;
    this.user_id = user_id;
    this.text = text;
    this.created_at = created_at;
  }

  static fromRow(row: AnswerDbRow): Answer {
    return new Answer(
      row.question_id,
      row.user_id,
      row.text,
      row.id,
      row.created_at
    );
  }

  static async findByQuestion(question_id: number): Promise<Answer[]> {
    const [rows] = await pool.query<AnswerDbRow[]>(
      `SELECT * FROM Odpoved 
       WHERE question_id = ? 
       ORDER BY created_at DESC`,
      [question_id]
    );

    return rows.map((row) => this.fromRow(row));
  }

  static async findByUser(user_id: number): Promise<Answer[]> {
    const [rows] = await pool.query<AnswerDbRow[]>(
      `SELECT * FROM Odpoved 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user_id]
    );

    return rows.map((row) => this.fromRow(row));
  }

  static async findById(id: number): Promise<Answer | null> {
    const [rows] = await pool.query<AnswerDbRow[]>(
      `SELECT * FROM Odpoved 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return this.fromRow(row);
  }

  async save(): Promise<void> {
    if (this.id) {
      await pool.query<ResultSetHeader>(
        `UPDATE Odpoved 
         SET text = ? 
         WHERE id = ?`,
        [this.text, this.id]
      );
    } else {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO Odpoved (question_id, user_id, text) 
         VALUES (?, ?, ?)`,
        [this.question_id, this.user_id, this.text]
      );
      this.id = result.insertId;
    }
  }

  async delete(): Promise<void> {
    if (!this.id) {
      throw new Error("Cannot delete answer without ID");
    }

    await pool.query<ResultSetHeader>(
      `DELETE FROM Odpoved WHERE id = ?`,
      [this.id]
    );
  }
}

export default Answer;
