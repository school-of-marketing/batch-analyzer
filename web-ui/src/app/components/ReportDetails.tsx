interface ReportData {
	name: string;
	timestamp: string;
	reports: Array<{
		filename: string;
		url?: string;
		score?: number;
		metrics?: {
			performance?: number;
			accessibility?: number;
			bestPractices?: number;
			seo?: number;
		};
	}>;
}

interface ReportDetailsProps {
	report: ReportData;
	onBack: () => void;
}

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

export default function ReportDetails({ report, onBack }: ReportDetailsProps) {
	const handleViewReport = (filename: string) => {
		// Open the HTML report via our API route
		const reportUrl = `/api/reports/${report.name}_${report.timestamp.replace(/[^0-9]/g, "")}/${filename}`;
		window.open(reportUrl, "_blank");
	};

	const handleDownloadReport = (filename: string) => {
		// Download the HTML report via our API route
		const reportUrl = `/api/reports/${report.name}_${report.timestamp.replace(/[^0-9]/g, "")}/${filename}`;
		const link = document.createElement("a");
		link.href = reportUrl;
		link.download = filename;
		link.click();
	};

	return (
		<div>
			<div className="mb-8">
				<button
					type="button"
					onClick={onBack}
					className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
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
					Back to Reports
				</button>

				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							{report.name}
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Generated on{" "}
							{new Date(report.timestamp.replace(" ", "T")).toLocaleString()}
						</p>
					</div>
					<div className="flex space-x-2">
						<button
							type="button"
							className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
									d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
								/>
							</svg>
							Export All
						</button>
						<button
							type="button"
							className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							Summary Report
						</button>
					</div>
				</div>
			</div>

			{/* Summary Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
						{report.reports.length}
					</div>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						Total Pages
					</div>
				</div>

				{(
					["performance", "accessibility", "bestPractices", "seo"] as const
				).map((metric) => {
					const scores = report.reports
						.map((r) => r.metrics?.[metric])
						.filter((score): score is number => score !== undefined);

					if (scores.length === 0) return null;

					const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

					return (
						<div
							key={metric}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
						>
							<ScoreGauge
								score={avg}
								label={
									metric === "bestPractices"
										? "Best Practices"
										: metric.charAt(0).toUpperCase() + metric.slice(1)
								}
							/>
						</div>
					);
				})}
			</div>

			{/* Individual Reports Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
				<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">
						Individual Reports
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-900">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									URL
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Performance
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Accessibility
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Best Practices
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									SEO
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{report.reports.map((pageReport) => (
								<tr
									key={pageReport.filename}
									className="hover:bg-gray-50 dark:hover:bg-gray-700"
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900 dark:text-white">
											{pageReport.url || pageReport.filename}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{pageReport.filename}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{pageReport.metrics?.performance ? (
											<span
												className={`text-sm font-medium ${getScoreColor(pageReport.metrics.performance)}`}
											>
												{pageReport.metrics.performance}
											</span>
										) : (
											<span className="text-sm text-gray-400">-</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{pageReport.metrics?.accessibility ? (
											<span
												className={`text-sm font-medium ${getScoreColor(pageReport.metrics.accessibility)}`}
											>
												{pageReport.metrics.accessibility}
											</span>
										) : (
											<span className="text-sm text-gray-400">-</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{pageReport.metrics?.bestPractices ? (
											<span
												className={`text-sm font-medium ${getScoreColor(pageReport.metrics.bestPractices)}`}
											>
												{pageReport.metrics.bestPractices}
											</span>
										) : (
											<span className="text-sm text-gray-400">-</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{pageReport.metrics?.seo ? (
											<span
												className={`text-sm font-medium ${getScoreColor(pageReport.metrics.seo)}`}
											>
												{pageReport.metrics.seo}
											</span>
										) : (
											<span className="text-sm text-gray-400">-</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										<div className="flex space-x-2">
											<button
												type="button"
												onClick={() => handleViewReport(pageReport.filename)}
												className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
											>
												View
											</button>
											<button
												type="button"
												onClick={() =>
													handleDownloadReport(pageReport.filename)
												}
												className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
											>
												Download
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
