import type { ReportCollection } from "../../types";
import { hasArabicContent } from "../utils/urlUtils";

interface ReportCardProps {
	collection: ReportCollection;
	onSelect: () => void;
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

export default function ReportCard({ collection, onSelect }: ReportCardProps) {
	const lastRun = collection.lastRun;
	if (!lastRun) return null; // Or a placeholder

	const averageScore = lastRun.avgScore ?? 0;
	const totalReports = lastRun.reports.length;

	return (
		<button
			type="button"
			onClick={onSelect}
			className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						{collection.name}
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
						{formatTimestamp(lastRun.timestamp)}
					</p>
				</div>
				<div
					className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(
						averageScore,
					)} ${getScoreColor(averageScore)}`}
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
				{collection.urls.some((url) => hasArabicContent(url)) && (
					<div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
						<svg
							className="w-3 h-3 mr-1"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<title>Arabic Content</title>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 6.332a.75.75 0 10-1.064 1.064l2.25 2.25a.75.75 0 001.06 0l2.25-2.25a.75.75 0 00-1.06-1.064L6.5 7.94V3.75a.75.75 0 00-1.5 0v4.19L4.332 6.332zm10.5 0a.75.75 0 10-1.064 1.064l2.25 2.25a.75.75 0 001.06 0l2.25-2.25a.75.75 0 00-1.06-1.064L16.5 7.94V3.75a.75.75 0 00-1.5 0v4.19l-.668-.668zM4.5 11.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z"
								clipRule="evenodd"
							/>
						</svg>
						<span>Contains Arabic URLs</span>
					</div>
				)}

				{/* List a few URLs */}
				<div className="pt-2">
					<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
						Example URLs:
					</p>
					<ul className="space-y-1">
						{collection.urls.slice(0, 3).map((url) => (
							<li
								key={url}
								className="text-xs text-gray-600 dark:text-gray-300 truncate"
								title={url}
							>
								{url}
							</li>
						))}
						{collection.urls.length > 3 && (
							<li className="text-xs text-gray-400">
								+ {collection.urls.length - 3} more
							</li>
						)}
					</ul>
				</div>
			</div>
		</button>
	);
}
