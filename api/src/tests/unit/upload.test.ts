import express, { Express, Request, Response } from "express";
import request from "supertest";
import upload from "../../middleware/upload.js";
import sharp from "sharp";

const app: Express = express();

app.post("/avatar", upload.avatar, (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  return res.send(file.buffer);
});

app.post("/post", upload.post, (req: Request, res: Response) => {
  return res.send(req.files);
});

const server = app.listen();

describe("upload middleware", () => {
  const dirPath = "./src/tests/files/";

  afterAll(() => server.close());

  describe("avatar", () => {
    let filename: string;

    const exec = () =>
      request(server)
        .post("/avatar")
        .attach("avatar", dirPath + filename);

    const testConvertedBuffer = async (filename_: string) => {
      filename = filename_;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(Buffer.isBuffer(res.body)).toBeTruthy();

      const data = await sharp(res.body).metadata();
      expect(data.width).toBe(128);
      expect(data.height).toBe(128);
      expect(data.format).toBe("webp");
    };

    it("should return converted buffer if file is webp", async () => {
      await testConvertedBuffer("img.webp");
    });

    it("should return converted buffer if file is png", async () => {
      await testConvertedBuffer("img.png");
    });

    it("should return converted buffer if file is jpg", async () => {
      await testConvertedBuffer("img.jpg");
    });

    it("should return 413 if image is too big", async () => {
      filename = "21mb.png";
      const { status } = await exec();
      expect(status).toBe(413);
    });

    it("should return 415 if file is not image", async () => {
      filename = "file.txt";
      const { status } = await exec();
      expect(status).toBe(415);
    });

    it("should return 400 if image is not passed", async () => {
      const { status } = await request(server).post("/avatar");
      expect(status).toBe(400);
    });
  });

  describe("post", () => {
    let filenames: string[];

    const exec = () =>
      request(server)
        .post("/post")
        .attach("images", dirPath + filenames[0])
        .attach("images", dirPath + filenames[1])
        .attach("images", dirPath + filenames[2])
        .attach("images", dirPath + filenames[3]);

    it("should return converted buffers", async () => {
      filenames = ["img.webp", "img.png", "img.jpg", "img.webp"];
      const { body } = await exec().expect(200);

      expect(body.length).toBe(4);

      for (let i = 0; i < body.length; i++) {
        const metadata = await sharp(Buffer.from(body[i].buffer)).metadata();
        expect(metadata.format).toBe("webp");
        expect(metadata.width).toBeLessThanOrEqual(1080);
        expect(metadata.height).toBeLessThanOrEqual(720);
      }
    });

    it("should return 200 if image is not passed", async () => {
      await request(server).post("/post").expect(200);
    });

    it("should return 422 if too many files are uploaded", async () => {
      const res = await request(server)
        .post("/post")
        .attach("images", dirPath + "img.webp")
        .attach("images", dirPath + "img.webp")
        .attach("images", dirPath + "img.webp")
        .attach("images", dirPath + "img.webp")
        .attach("images", dirPath + "img.webp");
      expect(res.status).toBe(422);
    });

    it("should return 413 if image is too big", async () => {
      filenames = ["img.webp", "img.webp", "21mb.png", "img.webp"];
      await exec().expect(413);
    });

    it("should return 415 if file is not image", async () => {
      filenames = ["img.webp", "img.webp", "file.txt", "img.webp"];
      await exec().expect(415);
    });
  });
});
