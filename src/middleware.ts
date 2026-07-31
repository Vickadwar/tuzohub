import { proxy } from "./proxy";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await proxy(request);
}

export { config } from "./proxy";
