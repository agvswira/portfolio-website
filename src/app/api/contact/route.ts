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
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
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
    console.error("[Contact Form]", {
      code: "CONTACT_SERVICE_UNAVAILABLE",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "Form kontak sedang tidak tersedia." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: contactEmail,
        reply_to: email,
        subject: `[Portfolio] Pesan dari ${name}`,
        text: `Dari: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.error("[Contact Form]", {
        code: "CONTACT_PROVIDER_ERROR",
        status: res.status,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Gagal mengirim email." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    console.error("[Contact Form]", {
      code: "CONTACT_NETWORK_ERROR",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: "Gagal mengirim email." }, { status: 502 });
  }
}
