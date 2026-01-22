import fs from "fs";

import path from "path";

import { NextResponse } from "next/server";

export async function GET() {

  const file = path.join(process.cwd(), "public", "data", "metaData.json");

  const json = JSON.parse(fs.readFileSync(file, "utf-8"));

  return NextResponse.json(json);

}

