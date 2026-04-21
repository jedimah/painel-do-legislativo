import { buscarMaterias } from "../_lib/legislativo.js";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  try {
    const result = await buscarMaterias(Object.fromEntries(url.searchParams.entries()));

    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Falha inesperada ao processar a consulta.";

    return Response.json({
      error: message,
      details: error.details || null
    }, {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
