import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { hasSupabaseEnv } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = hasSupabaseEnv();
