import {} from "@shared/schema";
import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { z } from "zod";

const liveClockRouter: Router = Router();

liveClockRouter.post("/", async (req: Request, res: Response) => {

  const urlSchema = z.object({
    url: z.string().url(),
  });

  const parsedUrl = urlSchema.safeParse(req.body);

  if (!parsedUrl.success) {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  try {
    const response = await fetch(parsedUrl.data.url, { method: "GET", redirect: "manual" });

    if (!response.ok) {
      res.status(response.status).json({ error: `Request failed with status ${response.status}` });
      return;
    }

    const serverTime = response.headers.get("Date") || null;

    const responseSchema = z.object({
      serverTime: z.string().nullable(),
    });

    const validatedResponse = responseSchema.safeParse({ serverTime });

    if (!validatedResponse.success) {
      res.status(500).json({ error: "Invalid response format" });
      return;
    }

    res.json(validatedResponse.data);
  } catch (error) {

    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch the URL" });
  }
});

export default liveClockRouter;
export { liveClockRouter };