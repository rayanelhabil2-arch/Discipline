// Disciplina · conecta sola la app instalada: recibe la suscripción push del móvil (un secreto que solo
// ese móvil conoce) y, si está asociada a una clave de sincronización, se la devuelve.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "https://rayanelhabil2-arch.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("no", { status: 405, headers: CORS });
  let body: { endpoint?: string; auth?: string } = {};
  try { body = await req.json(); } catch (_) { /* vacío */ }
  if (!body.endpoint || !body.auth || body.endpoint.length > 1000) return Response.json({ key: null }, { headers: CORS });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  // hay que saber el endpoint Y su clave auth: las dos cosas solo las tiene el móvil
  const { data } = await db.from("disciplina_push_subs").select("sync_key").eq("endpoint", body.endpoint).eq("auth", body.auth).maybeSingle();
  return Response.json({ key: data?.sync_key ?? null }, { headers: CORS });
});
