import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import type { ReportCollection, ReportFile, ReportRun } from "../../../types";

function parseReportsDirectory(): ReportCollection[] {
	try {
		const reportsPath = path.join(process.cwd(), "../reports");

		if (!fs.existsSync(reportsPath)) {
			return [];
		}

		const directories = fs
			.readdirSync(reportsPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		const runs: ReportRun[] = [];

		for (const dirName of directories) {
			const dirPath = path.join(reportsPath, dirName);

			const match = dirName.match(/^(.+)_(\d{8})_(\d{6})$/);
			if (!match) continue;

			const [, name, date, time] = match;
			const timestamp = `${date.substring(0, 4)}-${date.substring(
				4,
				6,
			)}-${date.substring(6, 8)} ${time.substring(0, 2)}:${time.substring(
				2,
				4,
			)}:${time.substring(4, 6)}`;

			const htmlFiles = fs
				.readdirSync(dirPath)
				.filter((file) => file.endsWith(".html"));

			let info: string | undefined;
			try {
				const infoPath = path.join(dirPath, "info.txt");
				if (fs.existsSync(infoPath)) {
					info = fs.readFileSync(infoPath, "utf-8");
				}
			} catch (error) {
				console.error(`Error reading info.txt for ${dirName}:`, error);
			}

			const reportFiles: ReportFile[] = htmlFiles.map((filename) => {
				const filePath = path.join(dirPath, filename);
				let url: string | undefined;
				let score: number | undefined;
				const metrics: Record<string, number> = {};

				try {
					const content = fs.readFileSync(filePath, "utf-8");
					const jsonMatch = content.match(
						/window\.__LIGHTHOUSE_JSON__\s*=\s*({[\s\S]+?});/,
					);

					if (jsonMatch) {
						const lighthouseData = JSON.parse(jsonMatch[1]);
						url = lighthouseData.finalDisplayedUrl;

						if (url) {
							try {
								url = decodeURIComponent(url);
							} catch (e) {
								console.warn(`Failed to decode URL: ${url}`, e);
							}
						}

						if (lighthouseData.categories) {
							if (lighthouseData.categories.performance) {
								metrics.performance = Math.round(
									lighthouseData.categories.performance.score * 100,
								);
							}
							if (lighthouseData.categories.accessibility) {
								metrics.accessibility = Math.round(
									lighthouseData.categories.accessibility.score * 100,
								);
							}
							if (lighthouseData.categories["best-practices"]) {
								metrics.bestPractices = Math.round(
									lighthouseData.categories["best-practices"].score * 100,
								);
							}
							if (lighthouseData.categories.seo) {
								metrics.seo = Math.round(
									lighthouseData.categories.seo.score * 100,
								);
							}
						}

						const totalScore = Object.values(metrics).reduce(
							(sum, s) => sum + s,
							0,
						);
						score =
							Object.values(metrics).length > 0
								? Math.round(totalScore / Object.values(metrics).length)
								: 0;
					}
				} catch (error) {
					console.error(`Error parsing file ${filename}:`, error);
				}

				return { filename, url, score, metrics };
			});

			const totalScore = reportFiles.reduce(
				(sum, file) => sum + (file.score || 0),
				0,
			);
			const avgScore =
				reportFiles.length > 0
					? Math.round(totalScore / reportFiles.length)
					: 0;

			runs.push({
				name,
				timestamp,
				full_name: dirName,
				reports: reportFiles,
				avgScore,
				info,
			});
		}

		// Group runs by name into collections
		const collections: Record<string, ReportCollection> = {};
		for (const run of runs) {
			if (!collections[run.name]) {
				collections[run.name] = {
					name: run.name,
					urls: run.reports.map((r: ReportFile) => r.url || "").sort(),
					runs: [],
				};
			}
			collections[run.name].runs.push(run);
		}

		// Sort runs within each collection and find the last run
		for (const name in collections) {
			collections[name].runs.sort(
				(a: ReportRun, b: ReportRun) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);
			collections[name].lastRun = collections[name].runs[0];
		}

		return Object.values(collections);
	} catch (error) {
		console.error("Error parsing reports directory:", error);
		return [];
	}
}

export async function GET() {
	const reports = parseReportsDirectory();
	return NextResponse.json({ reports });
}
