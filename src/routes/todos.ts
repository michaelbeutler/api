import express from "express";
import authenticate from "../middlewares/authenticate";
import { ITodo, getAll, getById, add } from "../models/todo";
import IResponse from "../interfaces/response";

/**
 * Defines the `/todos` route.
 * This class is exported via es6 export syntax.
 *
 * ```ts
 * export default router;
 * ```
 */
const router: express.IRouter = express.Router();

/**
 * Mock array to simulate database mutations.
 * @remark The array contains 1 item per default.
 */
const todos: ITodo[] = [{ id: 1, text: "Test", isDone: false, url: "" }];

router.get("/", authenticate, (req: express.Request, res: express.Response) => {
  let limit: number = Number(req.query.limit);
  let orderBy: string[] = String(req.query.orderBy).split(",");

  if (!limit) {
    /** Set default limit. */
    limit = 20;
  }

  if (!orderBy || orderBy.length < 1 || orderBy[0] === "undefined") {
    /** Set default order by. */
    orderBy = ["id desc"];
  }

  getAll(limit, orderBy)
    .then((result: { todos: ITodo[] }) => {
      const resObj: IResponse = {
        status: 200,
        message: "ok",
        payload: {
          ...result,
        },
      };
      return res.status(200).json(resObj);
    })
    .catch((error: any) => {
      const resObj: IResponse = {
        status: 500,
        message: "internal server error: " + error,
      };
      return res.status(500).json(resObj);
    });
});

router.get(
  "/:id",
  authenticate,
  (req: express.Request, res: express.Response) => {
    let id: number = Number(req.params.id);

    if (!id) {
      const resObj: IResponse = {
        status: 404,
        message: "not found: invalid id",
      };
      return res.status(404).json(resObj);
    }

    getById(id)
      .then((result: { todo: ITodo | null }) => {
        if (result.todo) {
          const resObj: IResponse = {
            status: 200,
            message: "ok",
            payload: { todo: result.todo },
          };
          return res.status(200).json(resObj);
        } else {
          const resObj: IResponse = { status: 404, message: "not found" };
          return res.status(404).json(resObj);
        }
      })
      .catch((error: any) => {
        const resObj: IResponse = {
          status: 500,
          message: "internal server error: " + error,
        };
        return res.status(500).json(resObj);
      });
  }
);

router.post(
  "/",
  authenticate,
  (req: express.Request, res: express.Response) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      const resObj: IResponse = { status: 400, message: "no content provided" };
      return res.status(400).json(resObj);
    }

    if (!req.body.text) {
      const resObj: IResponse = { status: 400, message: "no content provided" };
      return res.status(400).json(resObj);
    }

    const text: string = req.body.text.trim();
    const isDone: boolean = req.body.isDone === true;
    add(text, isDone)
      .then((result: { todo: ITodo }) => {
        const resObj: IResponse = {
          status: 201,
          message: "ok",
          payload: result.todo,
        };
        return res.status(201).json(resObj);
      })
      .catch((error: any) => {
        const resObj: IResponse = {
          status: 500,
          message: "internal server error: " + error,
        };
        return res.status(500).json(resObj);
      });
  }
);

router.put(
  "/:id",
  authenticate,
  (req: express.Request, res: express.Response) => {
    const index = todos.findIndex((t) => t.id === parseInt(req.params.id, 10));
    if (index === -1) {
      return res.status(404).json({ status: 404, message: "not found" });
    }

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "no content provided" });
    }

    if (!req.body.text && !req.body.isDone === undefined) {
      return res
        .status(400)
        .json({ status: 400, message: "no content provided" });
    }

    if (req.body.isDone !== undefined) {
      todos[index] = Object.assign({}, todos[index], {
        isDone: req.body.isDone,
      });
    }

    if (req.body.text !== undefined) {
      todos[index] = Object.assign({}, todos[index], {
        text: req.body.text.trim(),
      });
    }

    return res
      .status(201)
      .json({ status: 201, message: "ok", todo: todos[index] });
  }
);

router.delete(
  "/:id",
  authenticate,
  (req: express.Request, res: express.Response) => {
    const index = todos.findIndex((t) => t.id === parseInt(req.params.id, 10));
    if (index === -1) {
      return res.status(404).json({ status: 404, message: "not found" });
    }
    todos.splice(index, 1);
    return res.status(201).json({ status: 201, message: "ok" });
  }
);

export default router;
