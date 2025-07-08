import { hasArabicContent } from "../utils/urlUtils";

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

interface ReportCardProps {
	report: ReportData;
	onClick: () => void;
}

function formatTimestamp(timestamp: string): string {
	try {
		// Convert timestamp format: "2025-07-06 13:34:33" to proper date
		const date = new Date(timestamp.replace(" ", "T"));
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return timestamp;
	}
}

function getScoreColor(score: number): string {
	if (score >= 90) return "text-green-600 dark:text-green-400";
	if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
	return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
	if (score >= 90) return "bg-green-100 dark:bg-green-900/20";
	if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/20";
	return "bg-red-100 dark:bg-red-900/20";
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
	const averageScore =
		report.reports.reduce((acc, rep) => {
			return acc + (rep.score || 0);
		}, 0) / report.reports.length;

	const totalReports = report.reports.length;

	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						{report.name}
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
						{formatTimestamp(report.timestamp)}
					</p>
				</div>
				<div
					className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(averageScore)} ${getScoreColor(averageScore)}`}
				>
					{Math.round(averageScore)}
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 dark:text-gray-400">Total Pages</span>
					<span className="font-medium text-gray-900 dark:text-white">
						{totalReports}
					</span>
				</div>

				{/* Arabic content indicator */}
				{report.reports.some((r) => r.url && hasArabicContent(r.url)) && (
					<div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
						<svg
							className="w-3 h-3 mr-1"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
								clipRule="evenodd"
							/>
						</svg>
						Contains Arabic content
					</div>
				)}

				{/* Performance Metrics Summary */}
				{report.reports.some((r) => r.metrics) && (
					<div className="space-y-2">
						<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Metrics Average
						</div>
						<div className="grid grid-cols-2 gap-2 text-xs">
							{(
								[
									"performance",
									"accessibility",
									"bestPractices",
									"seo",
								] as const
							).map((metric) => {
								const avg =
									report.reports
										.filter((r) => r.metrics?.[metric])
										.reduce((acc, r) => acc + (r.metrics?.[metric] || 0), 0) /
									report.reports.filter((r) => r.metrics?.[metric]).length;

								if (!avg) return null;

								return (
									<div key={metric} className="flex justify-between">
										<span className="text-gray-500 dark:text-gray-400 capitalize">
											{metric === "bestPractices" ? "Best Practices" : metric}
										</span>
										<span className={`font-medium ${getScoreColor(avg)}`}>
											{Math.round(avg)}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-500 dark:text-gray-400">
						View Details
					</span>
					<svg
						className="w-4 h-4 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</div>
			</div>
		</button>
	);
}
