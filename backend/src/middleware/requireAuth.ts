import type { Request, Response, NextFunction } from "express";
import { supabase } from "../supabaseClient.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
}