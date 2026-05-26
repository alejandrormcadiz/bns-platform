import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GroqPayload = {
  empresa?: unknown;
  bnsMetrics?: unknown;
  forecast?: unknown;
  pressure?: unknown;
  predictive?: unknown;
  executiveHeatmap?: unknown;
  timeline?: unknown;
  strategic?: unknown;
  leads?: unknown;
  ejecutivos?: unknown;
  acciones?: unknown;
};

function compactar(valor: unknown) {
  try {
    return JSON.stringify(valor, null, 2).slice(0, 16000);
  } catch {
    return String(valor);
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "BNS Groq API route activo",
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
    groqKeyPrefix: process.env.GROQ_API_KEY
      ? `${process.env.GROQ_API_KEY.slice(0, 4)}...`
      : null,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Falta GROQ_API_KEY en .env.local. Agrega GROQ_API_KEY=gsk_... y reinicia npm run dev.",
          debug: {
            hasGroqKey: false,
          },
        },
        { status: 500 }
      );
    }

    if (!apiKey.startsWith("gsk_")) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "GROQ_API_KEY no parece válida. Debe empezar con gsk_. Revisa que no tenga comillas, espacios o saltos extra.",
          debug: {
            startsWith: apiKey.slice(0, 4),
            length: apiKey.length,
          },
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as GroqPayload;

    const prompt = `
Eres BNS™, Business Nervous System.

Actúa como advisor ejecutivo para CEO, CFO y Dirección General.
No hables como chatbot. Habla como motor de inteligencia empresarial.

Analiza estos datos actuales de la empresa:

EMPRESA:
${compactar(body.empresa)}

VITAL SIGNALS / BNS METRICS:
${compactar(body.bnsMetrics)}

FORECAST:
${compactar(body.forecast)}

ORGANIZATIONAL PRESSURE:
${compactar(body.pressure)}

PREDICTIVE ENGINE:
${compactar(body.predictive)}

EXECUTIVE HEATMAP:
${compactar(body.executiveHeatmap)}

TIMELINE NEURAL:
${compactar(body.timeline)}

STRATEGIC ANALYSIS / FODA / PESTEL:
${compactar(body.strategic)}

OPPORTUNITY SIGNALS / LEADS:
${compactar(body.leads)}

EXECUTIVES:
${compactar(body.ejecutivos)}

EXECUTIVE INTERVENTIONS / ACTIONS:
${compactar(body.acciones)}

Entrega la respuesta en español, con este formato:

1. Diagnóstico ejecutivo
2. Riesgos principales
3. Dependencias organizacionales
4. Lectura de forecast
5. Señales predictivas
6. Intervenciones recomendadas
7. Decisión recomendada para CEO/CFO

Sé directo, ejecutivo y accionable.
`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          max_tokens: 1800,
          messages: [
            {
              role: "system",
              content:
                "Eres BNS™, un motor de inteligencia ejecutiva empresarial. Das diagnósticos claros para dirección.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    let data: any = null;

    try {
      data = await groqResponse.json();
    } catch {
      data = {
        raw: await groqResponse.text(),
      };
    }

    if (!groqResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.error?.message ||
            `Groq respondió con HTTP ${groqResponse.status}. Revisa API key, modelo, permisos o límites.`,
          debug: {
            status: groqResponse.status,
            statusText: groqResponse.statusText,
            model,
            groqRaw: data,
          },
        },
        { status: groqResponse.status }
      );
    }

    return NextResponse.json({
      ok: true,
      respuesta: data?.choices?.[0]?.message?.content || "",
      model,
      debug: {
        usage: data?.usage || null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido conectando Groq.";

    console.error("BNS Groq API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: message,
        debug: {
          type: error instanceof Error ? error.name : typeof error,
          stack:
            process.env.NODE_ENV === "development" && error instanceof Error
              ? error.stack
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}
