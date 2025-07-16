import { useState } from "react";
import type { ReportCollection, ReportRun } from "../../types";
import {
	decodeArabicUrl,
	getDisplayUrl,
	hasArabicContent,
} from "../utils/urlUtils";
import ProgressionAnalysis from "./ProgressionAnalysis";

interface ReportDetailsProps {
	collection: ReportCollection;
	onBack: () => void;
}

type PageSortOption =
	| "url"
	| "performance"
	| "accessibility"
	| "bestPractices"
	| "seo"
	| "overall";
type PageFilterOption = "all" | "high" | "medium" | "low";

function getScoreColor(score: number): string {
	if (score >= 90) return "text-green-600 dark:text-green-400";
	if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
	return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
	if (score >= 90)
		return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800";
	if (score >= 50)
		return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
	return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
	return (
		<div className="text-center">
			<div
				className={`mx-auto w-16 h-16 rounded-full border-4 ${getScoreBgColor(score)} flex items-center justify-center mb-2`}
			>
				<span className={`text-lg font-bold ${getScoreColor(score)}`}>
					{Math.round(score)}
				</span>
			</div>
			<div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
		</div>
	);
}

export default function ReportDetails({
	collection,
	onBack,
}: ReportDetailsProps) {
	const [selectedRun, setSelectedRun] = useState<ReportRun>(collection.runs[0]);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<PageSortOption>("url");
	const [filterBy, setFilterBy] = useState<PageFilterOption>("all");
	const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

	const handleExportAll = () => {
		// Create a zip download of all reports in this batch
		alert(`Downloading ${selectedRun.reports.length} reports individually...`);

		selectedRun.reports.forEach((pageReport, index) => {
			setTimeout(() => {
				handleDownloadReport(pageReport.filename);
			}, index * 500); // Stagger downloads
		});
	};

	const handleGenerateSummary = () => {
		// Generate a summary report
		alert(
			"Summary report generation is not yet implemented. This would typically generate a PDF or CSV summary of all the reports.",
		);
	};

	const handleViewReport = (filename: string) => {
		// Open the HTML report via our API route
		const directoryName = selectedRun.full_name;
		const reportUrl = `/api/reports/${directoryName}/${filename}`;
		window.open(reportUrl, "_blank");
	};

	const handleDownloadReport = (filename: string) => {
		const directoryName = selectedRun.full_name;
		const downloadUrl = `/api/reports/${directoryName}/${filename}?download=true`;
		window.location.href = downloadUrl;
	};

	// Filter and sort individual page reports
	const filteredAndSortedPages = selectedRun.reports
		.filter((report) => {
			const matchesSearch =
				searchTerm === "" ||
				report.url?.toLowerCase().includes(searchTerm.toLowerCase());

			const score = report.score ?? 0;
			let matchesFilter = true;
			switch (filterBy) {
				case "high":
					matchesFilter = score >= 80;
					break;
				case "medium":
					matchesFilter = score >= 50 && score < 80;
					break;
				case "low":
					matchesFilter = score < 50;
					break;
				default:
					matchesFilter = true;
			}
			return matchesSearch && matchesFilter;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "url":
					return (a.url ?? "").localeCompare(b.url ?? "");
				case "performance":
					return (b.metrics?.performance ?? 0) - (a.metrics?.performance ?? 0);
				case "accessibility":
					return (
						(b.metrics?.accessibility ?? 0) - (a.metrics?.accessibility ?? 0)
					);
				case "bestPractices":
					return (
						(b.metrics?.bestPractices ?? 0) - (a.metrics?.bestPractices ?? 0)
					);
				case "seo":
					return (b.metrics?.seo ?? 0) - (a.metrics?.seo ?? 0);
				case "overall":
					return (b.score ?? 0) - (a.score ?? 0);
				default:
					return 0;
			}
		});

	const averageMetrics = {
		performance:
			selectedRun.reports.reduce(
				(acc, r) => acc + (r.metrics?.performance ?? 0),
				0,
			) / selectedRun.reports.length,
		accessibility:
			selectedRun.reports.reduce(
				(acc, r) => acc + (r.metrics?.accessibility ?? 0),
				0,
			) / selectedRun.reports.length,
		bestPractices:
			selectedRun.reports.reduce(
				(acc, r) => acc + (r.metrics?.bestPractices ?? 0),
				0,
			) / selectedRun.reports.length,
		seo:
			selectedRun.reports.reduce((acc, r) => acc + (r.metrics?.seo ?? 0), 0) /
			selectedRun.reports.length,
	};

	const overallScore = selectedRun.avgScore ?? 0;

	return (
		<div>
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
				<div>
					<button
						type="button"
						onClick={onBack}
						className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back to All Reports
					</button>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						{collection.name}
					</h1>
				</div>
				<div className="mt-4 sm:mt-0 flex items-center gap-2">
					<select
						value={selectedRun.timestamp}
						onChange={(e) => {
							const newSelectedRun = collection.runs.find(
								(run) => run.timestamp === e.target.value,
							);
							if (newSelectedRun) {
								setSelectedRun(newSelectedRun);
							}
						}}
						className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
					>
						{collection.runs.map((run) => (
							<option key={run.timestamp} value={run.timestamp}>
								{new Date(run.timestamp).toLocaleString()}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Summary Section */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
					<div>
						<h2 className="text-xl font-semibold">Analysis Summary</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{new Date(selectedRun.timestamp).toLocaleString("en-US", {
								dateStyle: "full",
								timeStyle: "short",
							})}
						</p>
					</div>
					<div className="mt-4 sm:mt-0 flex items-center space-x-3">
						<button
							type="button"
							onClick={handleGenerateSummary}
							className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<svg
								className="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7c0-1.1.9-2 2-2h5l4 4v10c0 1.1-.9 2-2 2z"
								/>
							</svg>
							Generate Summary
						</button>
						<button
							type="button"
							onClick={handleExportAll}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							<svg
								className="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Export All Reports
						</button>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
					<div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
						<div
							className={`text-4xl font-bold mb-1 ${getScoreColor(overallScore)}`}
						>
							{Math.round(overallScore)}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Overall Score
						</div>
					</div>
					<ScoreGauge score={averageMetrics.performance} label="Performance" />
					<ScoreGauge
						score={averageMetrics.accessibility}
						label="Accessibility"
					/>
					<ScoreGauge
						score={averageMetrics.bestPractices}
						label="Best Practices"
					/>
					<ScoreGauge score={averageMetrics.seo} label="SEO" />
				</div>
			</div>

			{/* Pages List Section */}
			<div>
				<h2 className="text-xl font-semibold mb-4">
					Page-by-Page Reports ({filteredAndSortedPages.length})
				</h2>

				{/* Filters for pages */}
				<div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
					<div className="relative w-full sm:w-auto">
						<svg
							className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							type="text"
							placeholder="Search URLs..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 dark:bg-gray-800 dark:border-gray-600"
						/>
					</div>

					<div className="flex items-center gap-4">
						<select
							value={filterBy}
							onChange={(e) => setFilterBy(e.target.value as PageFilterOption)}
							className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
						>
							<option value="all">All Scores</option>
							<option value="high">High (80+)</option>
							<option value="medium">Medium (50-79)</option>
							<option value="low">Low (&lt;50)</option>
						</select>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as PageSortOption)}
							className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
						>
							<option value="url">URL (A-Z)</option>
							<option value="overall">Overall Score</option>
							<option value="performance">Performance</option>
							<option value="accessibility">Accessibility</option>
							<option value="bestPractices">Best Practices</option>
							<option value="seo">SEO</option>
						</select>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700/50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									URL
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Overall
								</th>
								<th
									scope="col"
									className="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Perf.
								</th>
								<th
									scope="col"
									className="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Access.
								</th>
								<th
									scope="col"
									className="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									Best Prac.
								</th>
								<th
									scope="col"
									className="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
								>
									SEO
								</th>
								<th scope="col" className="relative px-6 py-3">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
							{filteredAndSortedPages.map((pageReport) => (
								<tr
									key={pageReport.filename}
									className={`hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer ${selectedUrl === pageReport.url ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
									onClick={() => setSelectedUrl(pageReport.url || null)}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-1">
												<div
													className="text-sm font-medium text-gray-900 dark:text-white truncate"
													title={decodeArabicUrl(pageReport.url || "")}
												>
													{getDisplayUrl(pageReport.url || "")}
												</div>
												{hasArabicContent(pageReport.url || "") && (
													<div className="text-xs text-blue-500">
														(Contains Arabic)
													</div>
												)}
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreBgColor(pageReport.score ?? 0)} ${getScoreColor(pageReport.score ?? 0)}`}
										>
											{pageReport.score ?? "N/A"}
										</span>
									</td>
									<td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
										<span
											className={`text-sm ${getScoreColor(pageReport.metrics?.performance ?? 0)}`}
										>
											{pageReport.metrics?.performance ?? "N/A"}
										</span>
									</td>
									<td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
										<span
											className={`text-sm ${getScoreColor(pageReport.metrics?.accessibility ?? 0)}`}
										>
											{pageReport.metrics?.accessibility ?? "N/A"}
										</span>
									</td>
									<td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
										<span
											className={`text-sm ${getScoreColor(pageReport.metrics?.bestPractices ?? 0)}`}
										>
											{pageReport.metrics?.bestPractices ?? "N/A"}
										</span>
									</td>
									<td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center">
										<span
											className={`text-sm ${getScoreColor(pageReport.metrics?.seo ?? 0)}`}
										>
											{pageReport.metrics?.seo ?? "N/A"}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											type="button"
											onClick={() => handleViewReport(pageReport.filename)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
										>
											View
										</button>
										<span className="mx-2 text-gray-300 dark:text-gray-600">
											|
										</span>
										<button
											type="button"
											onClick={() => handleDownloadReport(pageReport.filename)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
										>
											Download
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="mt-8">
					<ProgressionAnalysis
						collection={collection}
						selectedUrl={selectedUrl}
					/>
				</div>
			</div>
		</div>
	);
}
