"use client";

import { useEffect, useState } from "react";
import ReportCard from "./ReportCard";
import ReportDetails from "./ReportDetails";

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

export default function ReportsOverview() {
	const [reports, setReports] = useState<ReportData[]>([]);
	const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchReports();
	}, []);

	const fetchReports = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/reports");
			if (!response.ok) {
				throw new Error("Failed to fetch reports");
			}
			const data = await response.json();
			setReports(data.reports || []);
		} catch (err) {
			setError("Failed to load reports");
			console.error("Error fetching reports:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
					<h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
						Error Loading Reports
					</h3>
					<p className="text-red-600 dark:text-red-400">{error}</p>
					<button
						type="button"
						onClick={fetchReports}
						className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (selectedReport) {
		return (
			<ReportDetails
				report={selectedReport}
				onBack={() => setSelectedReport(null)}
			/>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Performance Reports
				</h2>
				<p className="text-gray-600 dark:text-gray-400">
					View and analyze your Lighthouse performance reports
				</p>
			</div>

			{reports.length === 0 ? (
				<div className="text-center py-12">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
						No reports found
					</h3>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Get started by running a batch analysis
					</p>
					<div className="mt-6">
						<button
							type="button"
							className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Run Analysis
						</button>
					</div>
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{reports.map((report) => (
						<ReportCard
							key={`${report.name}-${report.timestamp}`}
							report={report}
							onClick={() => setSelectedReport(report)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
