import { NextResponse } from "next/server";

export type JsonFailBody = { success: false; message: string };
export type JsonSuccessBody<T extends Record<string, unknown>> = {
  success: true;
} & T;

/** Plain JSON body `{ success: false, message }` for API responses. */
export function jsonFailBody(message: string): JsonFailBody {
  return { success: false, message };
}

/** Plain JSON body `{ success: true, ...body }` for API responses. */
export function jsonSuccessBody<T extends Record<string, unknown>>(
  body: T,
): JsonSuccessBody<T> {
  return { success: true, ...body };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export function jsonFail(
  message: string,
  status = 400,
): NextResponse<JsonFailBody> {
  return NextResponse.json(jsonFailBody(message), { status });
}

export function jsonSuccess<T extends Record<string, unknown>>(
  body: T,
  status = 200,
): NextResponse<JsonSuccessBody<T>> {
  return NextResponse.json(jsonSuccessBody(body), { status });
}
