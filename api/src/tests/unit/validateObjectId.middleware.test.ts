import express, { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import validateObjectId from "../../middleware/validateObjectId.js";

const app: Express = express();

app.get("/api/:id", validateObjectId, (req, res) => {
  res.status(200).send();
});

const server = app.listen();

describe("validateObjectId middleware", () => {
  afterAll(() => {
    server.close();
  });

  it("should return 200", async () => {
    const objectId = new mongoose.Types.ObjectId();
    await request(server)
      .get("/api/" + objectId.toString())
      .expect(200);
  });

  it("should return 404", async () => {
    await request(server).get("/api/123").expect(404);
  });
});
