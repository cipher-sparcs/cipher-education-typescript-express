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

shortUrlRouter.post("/", (req: Request, res: Response)=> {
  try {
    console.log("Received body:", req.body);
    const parsed = urlSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error("Invalid URL format:", parsed.error);
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const { originalUrl } = parsed.data;
    const shortCode = generateShortCode();
    mappingTable[shortCode] = { originalUrl, visits: 0 };
    console.log("Updated mapping table:", mappingTable);
    res.json({ shortCode });
  } catch (error) {
    console.error("Failed to generate short code:", error);
    res.status(500).json({ error: "Failed to generate short code" });
  }
});

export default shortUrlRouter;