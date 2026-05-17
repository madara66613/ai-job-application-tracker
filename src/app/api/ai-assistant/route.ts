import { NextResponse } from "next/server";
import { createMockAiResult, generateOpenAiCompatibleResult } from "@/lib/ai";
import type { JobApplication } from "@/types";

export async function POST(request: Request) {
  let application: JobApplication | undefined;

  try {
    const body = (await request.json()) as { application?: JobApplication };
    application = body.application;

    if (!application?.company || !application.role) {
      return NextResponse.json(
        { error: "Application company and role are required." },
        { status: 400 },
      );
    }

    const result = await generateOpenAiCompatibleResult(application);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    if (application) {
      return NextResponse.json(createMockAiResult(application));
    }

    return NextResponse.json(
      { error: "AI assistant failed to generate a response." },
      { status: 500 },
    );
  }
}
