import { Router } from "express";
import { supabase } from "../supabaseClient.js";

export const tasksRouter = Router();

tasksRouter.get("/", async (req, res) => {
  const { project_id } = req.query;
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });
  if (project_id) query = query.eq("project_id", project_id as string);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

tasksRouter.post("/", async (req, res) => {
  const { project_id, title } = req.body;
  if (!project_id || !title) {
    return res.status(400).json({ error: "project_id and title are required" });
  }
  const { data, error } = await supabase
    .from("tasks")
    .insert({ project_id, title, user_id: req.user!.id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

tasksRouter.patch("/:id", async (req, res) => {
  const { title, is_done } = req.body;
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...(title !== undefined && { title }), ...(is_done !== undefined && { is_done }) })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

tasksRouter.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("tasks").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});