// Disciplina · envía las notificaciones con frases del sargento.
// pg_cron la llama cada 30 minutos (cabecera x-cron-secret). Según el día y la hora de Madrid
// decide si toca mandar algo. Con ?test=1 manda una al momento.
// Horario de Rayan: clase 8:00–14:30, recoge a su hermana a las 16:30, estudia hasta el gym
// (lun, mar, jue, vie 20:00–21:30) y se acuesta a las 23:00. Fines de semana libres.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const APP = "https://rayanelhabil2-arch.github.io/Discipline/";
const LV = [1, 2, 3, 4, 5], GYM = [1, 2, 4, 5], FINDE = [0, 6];

type Slot = { days: number[]; at: string; title: string; msgs: string[] };
const SLOTS: Slot[] = [
  { days: LV, at: "07:00", title: "⚔ Arriba, soldado", msgs: [
    "El día es tuyo si lo atacas primero. Sin móvil la primera hora.",
    "Te niegas a repetir 2º. Demuéstralo hoy.",
    "Nadie va a venir a hacerlo por ti. Levántate.",
    "Primero decide quién quieres ser. Después, hazlo. (Epicteto)",
  ]},
  { days: LV, at: "15:30", title: "🇫🇷🇩🇪 Duolingo antes de ir a por tu hermana", msgs: [
    "Francés y alemán, los dos. Suiza no espera.",
    "15 minutos ahora valen más que una hora mañana.",
  ]},
  { days: LV, at: "17:00", title: "📚 A estudiar", msgs: [
    "Los que dijeron que repetirías no van a estudiar por ti. Tú sí.",
    "Deberes al día. Sin excusas.",
    "Bachi, carnet, Suiza. En ese orden.",
    "No necesitas ganas. Necesitas empezar.",
  ]},
  { days: [3], at: "20:00", title: "🧠 Miércoles sin gym", msgs: [
    "¿Has terminado de estudiar? Si sí, descansa. Si no, termina.",
    "Hoy descansa el cuerpo, no la cabeza.",
  ]},
  { days: GYM, at: "19:30", title: "🏋️ Gym en 30 minutos", msgs: [
    "Merienda y a entrenar. Hoy no se negocia.",
    "Cansado también se puede. Hazlo cansado.",
    "Supera tu récord. Apúntalo en la app.",
  ]},
  { days: LV, at: "21:30", title: "🥤 Cuerpo y disciplina", msgs: [
    "Cena, batido y creatina. El volumen se hace en la cocina.",
    "¿Has llegado a tus calorías? Apúntalas.",
    "La disciplina es libertad. La pereza es una cárcel.",
  ]},
  { days: [0, 1, 2, 3, 4], at: "22:30", title: "💀 Cierra el día", msgs: [
    "Marca lo que has hecho. Un fallo se perdona. Dos, no.",
    "Examen nocturno: ¿qué has hecho bien? ¿En qué has fallado?",
    "Este día no volverá. ¿Lo has usado bien?",
    "A las 23:00, a la cama. Mañana se vuelve a la guerra.",
  ]},
  { days: FINDE, at: "10:00", title: "⚔ Finde, pero no de vacaciones", msgs: [
    "Dos horas de estudio y el resto es tuyo.",
    "Mientras otros duermen, tú adelantas.",
    "El que se queja se queda. El que actúa se va.",
  ]},
  { days: FINDE, at: "12:00", title: "🇫🇷🇩🇪 Duolingo", msgs: ["No rompas la racha. Francés y alemán."] },
  { days: [0], at: "19:00", title: "🗓️ Repaso del domingo", msgs: [
    "¿Qué cumpliste esta semana? ¿Qué fallaste? Planea la siguiente.",
    "¿Has leído tus 10 páginas? Aún estás a tiempo.",
  ]},
  { days: [5, 6], at: "23:30", title: "🌙 Cierra el día", msgs: [
    "Marca lo que has hecho hoy. Finde no es excusa.",
  ]},
];

const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function madridNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
  const m = Number(g("minute"));
  // el cron llega puntual a :00 y :30; redondeamos por si llega con unos segundos de retraso
  const mm = m < 15 ? "00" : m < 45 ? "30" : "00";
  const h = m >= 45 ? (Number(g("hour")) + 1) % 24 : Number(g("hour"));
  return { dow, at: String(h).padStart(2, "0") + ":" + mm };
}

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await db.from("disciplina_config").select("key,value");
  const c = Object.fromEntries((cfg ?? []).map((r) => [r.key, r.value]));
  if (!c.cron_secret || req.headers.get("x-cron-secret") !== c.cron_secret) {
    return new Response("no", { status: 401 });
  }

  const test = new URL(req.url).searchParams.get("test") === "1";
  const now = madridNow();
  const slot = test
    ? { title: "⚔ Disciplina", msgs: ["Las notificaciones funcionan. Ahora, a cumplir."] }
    : SLOTS.find((s) => s.at === now.at && s.days.includes(now.dow));
  if (!slot) return Response.json({ sent: 0, now, reason: "no toca" });

  webpush.setVapidDetails("mailto:rayanelhabil2@gmail.com", c.vapid_public, c.vapid_private);
  const payload = JSON.stringify({ title: slot.title, body: pick(slot.msgs), url: APP });

  const { data: subs } = await db.from("disciplina_push_subs").select("id,endpoint,p256dh,auth");
  let sent = 0, removed = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 1800 });
      sent++;
      await db.from("disciplina_push_subs").update({ last_ok: new Date().toISOString() }).eq("id", s.id);
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { await db.from("disciplina_push_subs").delete().eq("id", s.id); removed++; }
    }
  }
  return Response.json({ sent, removed, now });
});
