import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		service: "batch-analyzer",
		components: {
			webui: "ready",
			cli: "ready",
		},
	});
}
