import { Router } from "express";
import { semanticSearch } from "../services/search.service";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const start = performance.now();
    const { results, cached } = await semanticSearch(q);
    const took_ms = Math.round(performance.now() - start);

    res.json({ query: q, cached, took_ms, results });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;