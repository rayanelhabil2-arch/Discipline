// Disciplina · envía las notificaciones con frases del sargento.
// La llama pg_cron cada hora (con la cabecera x-cron-secret). Según la hora de Madrid
// decide si toca mandar algo y qué frase. Con ?test=1 manda una al momento.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const APP = "https://rayanelhabil2-arch.github.io/Discipline/";

// hora de Madrid -> [título, frases]
const SLOTS: Record<number, [string, string[]]> = {
  8: ["⚔ Arriba, soldado", [
    "El día es tuyo si lo atacas primero.",
    "Nadie va a venir a hacerlo por ti. Empieza.",
    "Te niegas a repetir 2º. Demuéstralo hoy.",
    "Primero decide quién quieres ser. Después, hazlo. (Epicteto)",
  ]],
  15: ["📚 Hora de estudiar", [
    "Los que dijeron que repetirías no van a estudiar por ti. Tú sí.",
    "Deberes al día. Sin excusas.",
    "Bachi, carnet, Suiza. En ese orden.",
    "No necesitas ganas. Necesitas empezar.",
  ]],
  18: ["🔥 La tarde se va", [
    "¿Duolingo hecho? Francés y alemán, los dos.",
    "Cansado también se puede. Hazlo cansado.",
    "Cada día que cumples estás más cerca de Suiza.",
    "El que se queja se queda. El que actúa se va.",
  ]],
  21: ["🏋️ Cuerpo y disciplina", [
    "¿Has comido suficiente? El volumen se hace en la cocina.",
    "Batido y creatina. Apunta las calorías.",
    "La disciplina es libertad. La pereza es una cárcel.",
    "Lo que se interpone en el camino se convierte en el camino. (Marco Aurelio)",
  ]],
  23: ["💀 Cierra el día", [
    "Marca lo que has hecho. Un fallo se perdona. Dos, no.",
    "Examen nocturno: ¿qué has hecho bien? ¿En qué has fallado?",
    "Este día no volverá. ¿Lo has usado bien?",
    "Pantallas fuera. Mañana se vuelve a la guerra.",
  ]],
};

const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await db.from("disciplina_config").select("key,value");
  const c = Object.fromEntries((cfg ?? []).map((r) => [r.key, r.value]));
  if (!c.cron_secret || req.headers.get("x-cron-secret") !== c.cron_secret) {
    return new Response("no", { status: 401 });
  }

  const url = new URL(req.url);
  const test = url.searchParams.get("test") === "1";
  const hour = Number(new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const slot = test ? ["⚔ Disciplina", ["Las notificaciones funcionan. Ahora, a cumplir."]] as [string, string[]] : SLOTS[hour];
  if (!slot) return Response.json({ sent: 0, hour, reason: "no toca" });

  webpush.setVapidDetails("mailto:rayanelhabil2@gmail.com", c.vapid_public, c.vapid_private);
  const payload = JSON.stringify({ title: slot[0], body: pick(slot[1]), url: APP });

  const { data: subs } = await db.from("disciplina_push_subs").select("id,endpoint,p256dh,auth");
  let sent = 0, removed = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
      sent++;
      await db.from("disciplina_push_subs").update({ last_ok: new Date().toISOString() }).eq("id", s.id);
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { await db.from("disciplina_push_subs").delete().eq("id", s.id); removed++; }
    }
  }
  return Response.json({ sent, removed, hour });
});
