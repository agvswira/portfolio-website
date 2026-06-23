import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 req/min per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: { name?: unknown; email?: unknown; message?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  // Honeypot check
  if (body.website) {
    return NextResponse.json({ ok: true }); // Silently accept bots
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  // Validation
  if (!name || name.length > 100)
    return NextResponse.json({ error: "Nama tidak valid." }, { status: 400 });
  if (!email || !isValidEmail(email) || email.length > 254)
    return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  if (!message || message.length < 10 || message.length > 5000)
    return NextResponse.json(
      { error: "Pesan terlalu pendek atau terlalu panjang." },
      { status: 400 }
    );

  const resendKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!resendKey || !contactEmail) {
    // Fallback: log to console when env vars not configured
    console.log("[Contact Form]", { name, email, message: message.slice(0, 200) });
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: `Portfolio Contact <${contactEmail}>`,
        to: contactEmail,
        reply_to: email,
        subject: `[Portfolio] Pesan dari ${name}`,
        text: `Dari: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!res.ok) throw new Error(`Resend error: ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "Gagal mengirim email." }, { status: 502 });
  }
}
