import { NextResponse } from "next/server";
import { getApiDocs } from "../../../../swagger.config";

export const GET = () => {
  const spec = getApiDocs();
  return NextResponse.json(spec);
};
