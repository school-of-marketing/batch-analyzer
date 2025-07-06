import { spawn } from "child_process";
import fs from "fs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import path from "path";

interface AnalysisConfig {
	name: string;
	urls: string[];
	reportsDir: string;
}

export async function POST(request: NextRequest) {
	try {
		const config: AnalysisConfig = await request.json();

		// Validate input
		if (!config.name || !config.urls || config.urls.length === 0) {
			return NextResponse.json(
				{ error: "Invalid configuration: name and urls are required" },
				{ status: 400 },
			);
		}

		// Create a temporary URLs file
		const tempDir = path.join(process.cwd(), "temp");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		const urlsFileName = `urls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`;
		const urlsFilePath = path.join(tempDir, urlsFileName);

		// Write URLs to temporary file
		fs.writeFileSync(urlsFilePath, config.urls.join("\n"));

		// Path to the Rust CLI binary
		const cliPath = path.join(
			process.cwd(),
			"../target/release/batch_analyzer",
		);

		// Check if CLI binary exists
		if (!fs.existsSync(cliPath)) {
			// Clean up temp file
			fs.unlinkSync(urlsFilePath);
			return NextResponse.json(
				{
					error:
						"Batch analyzer CLI not found. Please build the Rust project first.",
				},
				{ status: 500 },
			);
		}

		// Prepare CLI arguments
		const args = [
			"--name",
			config.name,
			"--file",
			urlsFilePath,
			"--reports-dir",
			config.reportsDir || "reports",
		];

		// Start the analysis process
		const analysisProcess = spawn(cliPath, args, {
			cwd: path.join(process.cwd(), ".."),
			stdio: "pipe",
			env: process.env,
		});

		// Set up process monitoring
		let output = "";
		let errorOutput = "";

		analysisProcess.stdout.on("data", (data) => {
			output += data.toString();
		});

		analysisProcess.stderr.on("data", (data) => {
			errorOutput += data.toString();
		});

		// Return immediately with process ID for monitoring
		const processId = analysisProcess.pid;

		// Clean up temp file after a delay (process should have read it by then)
		setTimeout(() => {
			if (fs.existsSync(urlsFilePath)) {
				fs.unlinkSync(urlsFilePath);
			}
		}, 10000);

		// Store process info for monitoring (in production, use Redis or similar)
		// For now, we'll just return success
		analysisProcess.on("close", (code) => {
			console.log(`Analysis process ${processId} exited with code ${code}`);
			if (code !== 0) {
				console.error(`Analysis failed with error: ${errorOutput}`);
			} else {
				console.log(`Analysis completed successfully: ${output}`);
			}
		});

		return NextResponse.json({
			success: true,
			message: "Analysis started successfully",
			processId,
			config: {
				name: config.name,
				urlCount: config.urls.length,
				reportsDir: config.reportsDir,
			},
		});
	} catch (error) {
		console.error("Error starting analysis:", error);
		return NextResponse.json(
			{ error: "Failed to start analysis" },
			{ status: 500 },
		);
	}
}
