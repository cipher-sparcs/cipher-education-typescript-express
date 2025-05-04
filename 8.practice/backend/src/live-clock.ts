import {} from "@shared/schema";
import { Router, Request, Response } from "express";
import { z } from "zod";

const liveClockRouter= Router();

liveClockRouter.post("/", async (req: Request, res: Response) => {

  try{
  
    const urlSchema = z.object({
      url: z.string().url(),
    });

    const parsedUrl = urlSchema.safeParse(req.body);

    if (!parsedUrl.success) {
      res.status(400).json({ error: "Invalid URL format" });
      return;
    }

    const { url } = parsedUrl.data;


    const response = await fetch(url, { method: "GET", redirect: "manual" });

    const serverTime = response.headers.get("Date");

    const responseSchema = z.object({
      serverTime: z.string().nullable(),
    });

    const validatedResponse = responseSchema.parse({ serverTime });

    res.json(validatedResponse);

  } catch (error) {

    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch the URL" });
  }
});

export default liveClockRouter;