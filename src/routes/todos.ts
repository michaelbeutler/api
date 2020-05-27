import express from "express";
import authenticate from "../middlewares/authenticate";

const router: express.IRouter = express.Router();

interface ITodo {
  id: number;
  text: string;
  isDone: boolean;
}
const todos: ITodo[] = [{ id: 1, text: "Test", isDone: false }];

router.get("/", authenticate, (req: express.Request, res: express.Response) => {
  return res
    .status(200)
    .json({ status: 200, message: "ok", count: todos.length, todos });
});

router.get(
  "/:id",
  authenticate,
  (req: express.Request, res: express.Response) => {
    const todo = todos.find((t) => t.id === parseInt(req.params.id, 10));
    if (!todo) {
      return res.status(404).json({ status: 404, message: "not found" });
    }
    return res.status(200).json({ status: 200, message: "ok", todo });
  }
);

router.post(
  "/",
  authenticate,
  (req: express.Request, res: express.Response) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "no content provided" });
    }

    if (!req.body.text) {
      return res
        .status(400)
        .json({ status: 400, message: "no content provided" });
    }

    const todo = {
      id: todos[todos.length - 1].id + 1,
      text: req.body.text.trim(),
      isDone: false,
    };
    todos.push(todo);

    return res.status(201).json({ status: 201, message: "ok", todo });
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
