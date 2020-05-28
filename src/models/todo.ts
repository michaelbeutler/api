import { dbc } from "../index";
import mysql from "mysql";

/**
 * Defines the table name in the database for this model.
 */
export const table: string = "todos";

/**
 * Defines the maximum limit for database requests.
 */
export const max: number = 100;

/**
 * Defines the schema of the table.
 */
export const schema: string[] = [
  "id",
  "id desc",
  "text",
  "text desc",
  "done",
  "done desc",
];

export interface ITodo {
  /** The `id` is a number to identify todo item. */
  id: number;
  /** Defines the `text` of the todo item. */
  text: string;
  /** Defines the state of the todo. */
  isDone: boolean;
  /** URL to the item. Exmaple: `/todos/1` */
  url: string;
}

/**
 * Function to retrive all todos in the database.
 * @param limit Limit the amount of todos. Default: `20`
 * @param orderBy Set an order for the result. Default: `["id desc"]`
 */
export function getAll(
  limit: number = 20,
  orderBy: string[] = ["id desc"]
): Promise<{
  count: number;
  limit: number;
  orderBy: string[];
  todos: ITodo[];
}> {
  /** Check if limit is bigger than {@link max} defined and modify if required. */
  if (limit > max) {
    limit = max;
  }
  /** Check if limit is smaller than `1` and modify if required. */
  if (limit < 1) {
    limit = 1;
  }

  /** Sanitize order by query param. */
  let orderByCleaned: string[] = [];
  if (orderBy.length > 0) {
    orderByCleaned = orderBy
      .map((item: string) => item.toLowerCase())
      .filter((item: string) => {
        /** Remove order by flags that are not present in {@link schema}. */
        return schema.indexOf(item) > -1;
      });
  }

  return new Promise<{
    count: number;
    limit: number;
    orderBy: string[];
    todos: ITodo[];
  }>((resolve, reject) => {
    dbc.query(
      `SELECT * FROM ${table} ${
        orderByCleaned.length > 0 ? `ORDER BY ${orderByCleaned.join(", ")}` : ""
      } ${limit ? `LIMIT ${limit}` : ""}`,
      (error: mysql.MysqlError, results) => {
        if (error) return reject(error);
        resolve({
          count: results.length,
          limit,
          orderBy: orderByCleaned,
          todos: results.map((result) => ({
            id: result.id,
            text: result.text,
            isDone: results.done === 1,
            url: `http://localhost:${process.env.PORT}/todos/${result.id}`,
          })),
        });
      }
    );
  });
}

/**
 * Get only one todo item.
 * @param id Used to get todo item by `id`.
 * @returns Returns Promise to handle loading and resolvs as defined.
 */
export function getById(id: number): Promise<{ todo: ITodo | null }> {
  return new Promise<{ todo: ITodo | null }>((resolve, reject) => {
    dbc.query(
      `SELECT * FROM ${table} WHERE id=${id} LIMIT 1`,
      (error: mysql.MysqlError, results) => {
        if (error) return reject(error);
        if (results.length === 1) {
          resolve({
            todo: {
              id: results[0].id,
              text: results[0].text,
              isDone: results[0].done === 1,
              url: `http://localhost:${process.env.PORT}/todos/${results[0].id}`,
            },
          });
        }
        resolve({ todo: null });
      }
    );
  });
}

/**
 * Adds new todo items to database and returns the inserted item.
 * @param text Todo item text.
 * @param isDone Todo state.
 */
export function add(
  text: string,
  isDone: boolean = false
): Promise<{ todo: ITodo }> {
  return new Promise<{ todo: ITodo }>((resolve, reject) => {
    dbc.query(
      `INSERT INTO ${table} SET ?`,
      { text, done: isDone },
      (error: mysql.MysqlError, results) => {
        if (error) return reject(error);
        resolve(getById(results.insertId));
      }
    );
  });
}
