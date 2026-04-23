import { Request, Response } from "express";

export const parseTranscript = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a .txt file" });
    }

    const content = req.file.buffer.toString("utf-8");

    if (!content.trim()) {
      return res.status(400).json({ error: "Uploaded file is empty" });
    }

    const segments: { time: string; text: string }[] = [];

    // Match each transcript segment: extract timestamp and text from HTML
    const segmentRegex =
      /<div[^>]*class="segment-timestamp[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/div>[\s\S]*?<yt-formatted-string[^>]*class="segment-text[^"]*"[^>]*>([\s\S]*?)<\/yt-formatted-string>/g;

    let match: RegExpExecArray | null;
    while ((match = segmentRegex.exec(content)) !== null) {
      const time = match[1].trim();
      const text = match[2].trim();
      if (time && text) {
        segments.push({ time, text });
      }
    }

    if (segments.length === 0) {
      return res.status(400).json({
        error: "No transcript segments found. Make sure the file contains YouTube transcript HTML.",
      });
    }

    // Build clean transcript text file - only script, no timestamps
    const output = segments
      .map((s) => s.text)
      .join("\n");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=transcript.txt");
    return res.status(200).send(output);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
