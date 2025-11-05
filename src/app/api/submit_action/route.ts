// app/api/submit_action/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

/* ----------------------- types (reuse yours) ----------------------- */
type PartnerBucket = { response?: { url?: string } | null };
type PartnerResults = {
  datingpost?: PartnerBucket;
  sevenclicks?: PartnerBucket;
  secondfling?: PartnerBucket;
  leadbull?: PartnerBucket;
};

interface IpLookup {
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
}

interface ClickLastQuestionPayload {
  ip_lookup: IpLookup | null;
  email: string;
  age_range_answer: string;
  advertiser_results: PartnerResults | null;
  full_url: string;
  created_at: string;
  action: "click-last-question";
}

type ClickLastQuestionResponse = {
  results?: PartnerResults;
};

/* ----------------------- helpers ----------------------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function getClientIp(req: NextRequest): string | null {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;

  const real = req.headers.get("x-real-ip");
  if (real) return real;

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }

  const r = req as unknown as Record<string, unknown>;
  if (typeof r.ip === "string" && r.ip) return r.ip;

  return null;
}

function sanitizeIp(ip: string | null): string | null {
  if (!ip) return null;
  if (ip === "::1" || ip === "localhost") return null;
  if (ip.startsWith("127.")) return null;
  return ip;
}

/* ----------------------- handler ----------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const json = isRecord(body) ? body : {};

    // Map client payload -> server payload
    const ipLookupIn = (json.ipLookup ?? null) as IpLookup | null;
    const email = String(json.email ?? "");
    const age_range_answer = String(json.ageRange ?? "");
    const advertiser_results = (json.currentResults ?? null) as PartnerResults | null;
    const full_url =
      typeof json.full_url === "string" && json.full_url
        ? json.full_url
        : request.headers.get("referer") ?? "";

    // Enrich IP if missing
    const reqIp = sanitizeIp(getClientIp(request));
    const ip_lookup: IpLookup | null =
      reqIp ? { ...(ipLookupIn ?? {}), ip: ipLookupIn?.ip || reqIp } : ipLookupIn;

    const payload: ClickLastQuestionPayload = {
      ip_lookup,
      email,
      age_range_answer,
      advertiser_results,
      full_url,
      created_at: new Date().toISOString(),
      action: "click-last-question",
    };

    const upstream = await axios.post<ClickLastQuestionResponse>(
      "https://torazzo.net/api/v1/landing-page-generator/action",
      payload,
      {
        headers: {
          "Landingpage-Action": "true",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        timeout: 15_000,
        validateStatus: () => true, // pass-through upstream status
      }
    );

    const ok = upstream.status >= 200 && upstream.status < 300;

    return NextResponse.json(
      {
        success: ok,
        data: upstream.data, // { results?: PartnerResults }
        status: upstream.status,
        ip: ip_lookup?.ip ?? "unknown",
      },
      { status: upstream.status }
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
