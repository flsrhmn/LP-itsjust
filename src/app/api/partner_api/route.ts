import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

/* ----------------------- helpers ----------------------- */

function getClientIp(req: NextRequest): string | null {
  // Common proxy headers (Cloudflare / Nginx / Vercel)
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;

  const real = req.headers.get("x-real-ip");
  if (real) return real;

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }

  // Some platforms attach `ip` dynamically. Avoid ts-ignore by narrowing via Record.
  const r = req as unknown as Record<string, unknown>;
  if (typeof r.ip === "string" && r.ip) {
    return r.ip;
  }

  return null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/* ----------------------- handler ----------------------- */

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));
    const payload: Record<string, unknown> = isRecord(json) ? json : {};

    let ip = getClientIp(request);
    if (!ip || ip === "::1" || ip.startsWith("127.") || ip === "localhost") {
      ip = null;
    }

    const partner_result = await axios.post(
      "https://torazzo.net/api/v1/landing-page-generator/partner_api",
      { ...payload, ...(ip ? { ip } : {}) },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "landingpage-preview": "true", // string, not boolean
          "Content-Type": "application/json",
        },
        timeout: 15_000,
        validateStatus: () => true, // pass through upstream status
      }
    );

    const ok = partner_result.status >= 200 && partner_result.status < 300;

    return NextResponse.json(
      {
        success: ok,
        data: partner_result.data as unknown, // keep as unknown to avoid leaking any
        status: partner_result.status,
        ip: ip ?? "unknown",
      },
      { status: partner_result.status }
    );
  } catch (e: unknown) {
    const ax = e as AxiosError<unknown>;
    const status = ax.response?.status ?? 500;
    const upstream = ax.response?.data ?? { message: ax.message ?? "Upstream error" };

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        upstream,
      },
      { status }
    );
  }
}
