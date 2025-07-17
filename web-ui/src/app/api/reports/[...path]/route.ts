import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

interface Params {
	path: string[];
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<Params> },
) {
	try {
		const { path: reportPath } = await params;

		if (!reportPath || reportPath.length < 2) {
			return NextResponse.json({ error: "Invalid path" }, { status: 400 });
		}

		const [directory, filename] = reportPath;
		const reportsDir = path.join(process.cwd(), "../reports");
		const filePath = path.join(reportsDir, directory, filename);

		// Security check - ensure the path is within the reports directory
		const normalizedPath = path.normalize(filePath);
		const normalizedReportsDir = path.normalize(reportsDir);

		if (!normalizedPath.startsWith(normalizedReportsDir)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		if (!fs.existsSync(filePath)) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		const content = fs.readFileSync(filePath, "utf-8");

		return new NextResponse(content, {
			headers: {
				"Content-Type": "text/html",
				"Cache-Control": "public, max-age=31536000", // 1 year cache
			},
		});
	} catch (error) {
		console.error("Error serving report file:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
