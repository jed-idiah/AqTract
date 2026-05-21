import { Hono } from "hono";
import { createTaskSchema, updateTaskSchema, searchTasksSchema } from "@aqtract/shared";
import * as taskService from "../services/task.service.js";

export const taskRoutes = new Hono()
  .post("/", async (c) => {
    const body = await c.req.json();
    const input = createTaskSchema.parse(body);
    const task = await taskService.createTask(input);
    return c.json(task, 201);
  })
  .get("/", async (c) => {
    const params = searchTasksSchema.parse(c.req.query());
    const tasks = await taskService.listTasks(params);
    return c.json({ data: tasks });
  })
  .get("/:taskId", async (c) => {
    const task = await taskService.getTaskById(c.req.param("taskId"));
    return c.json(task);
  })
  .patch("/:taskId", async (c) => {
    const body = await c.req.json();
    const input = updateTaskSchema.parse(body);
    const task = await taskService.updateTask(c.req.param("taskId"), input);
    return c.json(task);
  })
  .post("/:taskId/cancel", async (c) => {
    const task = await taskService.updateTask(c.req.param("taskId"), {
      status: "cancelled",
    });
    return c.json(task);
  });
