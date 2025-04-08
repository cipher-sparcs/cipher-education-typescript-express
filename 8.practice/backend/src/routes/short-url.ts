import { Router, Request, Response } from "express";
import { IMappingTable } from "@shared/schema";
import { z } from "zod";

const shortUrlRouter:Router = Router();
const mappingTable: IMappingTable = {};

interface ShortUrlRequestBody {
  originalUrl: string;
}

const urlSchema = z.object({
  originalUrl: z.string().url(),
});

const generateShortCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let shortCode;
  do {
    shortCode = Array.from({ length: 4 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
  } while (mappingTable[shortCode]);
  return shortCode;
};

shortUrlRouter.post("/", (req: Request, res: Response) => {
  try {
    const parseResult = urlSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid URL format" });
    }
    const { originalUrl } = parseResult.data!;

    const shortCode = generateShortCode();

    mappingTable[shortCode] = {
      originalUrl,
      visits: 0
    };

    res.json({ shortCode });
  } catch (error) {
    console.error("Failed to generate short code:", error);
    res.status(500).json({ error: "Failed to generate short code" });
  }
});

shortUrlRouter.get("/stats", (req: Request, res: Response) => {
  try {
    res.json(mappingTable);
  } catch (error) {
    console.error("Failed to parse mappingTable:", error);
    res.status(500).json({ error: "Failed to parse mappingTable" });
  }
});

shortUrlRouter.get("/", (req: Request, res: Response) => {
  try {
    const shortCode = req.query.shortCode as string;

    mappingTable[shortCode].visits += 1;

    res.redirect(mappingTable[shortCode].originalUrl);
  } catch (error) {
    console.error("Failed to redirect:", error);
    res.status(500).json({ error: "Failed to redirect" });
  }
});

export default shortUrlRouter;