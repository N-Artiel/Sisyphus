import { Router } from "express";
import { supabase } from "../supabaseClient.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

projectsRouter.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, user_id: req.user!.id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});