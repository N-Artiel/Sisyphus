import { Router } from "express";
import { supabase } from "../supabaseClient.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

projectsRouter.post("/", async (req, res) => {
  const { name, user_id } = req.body;
  if (!name || !user_id) {
    return res.status(400).json({ error: "name and user_id are required" });
  }
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, user_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});