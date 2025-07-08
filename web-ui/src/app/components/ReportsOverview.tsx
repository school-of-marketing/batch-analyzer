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

type SortOption = "newest" | "oldest" | "name" | "score" | "pages";
type FilterOption = "all" | "high" | "medium" | "low";

export default function ReportsOverview() {
	const [reports, setReports] = useState<ReportData[]>([]);
	const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("newest");
	const [filterBy, setFilterBy] = useState<FilterOption>("all");

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

	// Filter and sort reports
	const filteredAndSortedReports = reports
		.filter((report) => {
			// Search filter
			const matchesSearch =
				searchTerm === "" ||
				report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.reports.some((r) =>
					r.url?.toLowerCase().includes(searchTerm.toLowerCase()),
				);

			// Score filter
			const averageScore =
				report.reports.reduce((acc, rep) => acc + (rep.score || 0), 0) /
				report.reports.length;
			let matchesFilter = true;

			switch (filterBy) {
				case "high":
					matchesFilter = averageScore >= 80;
					break;
				case "medium":
					matchesFilter = averageScore >= 50 && averageScore < 80;
					break;
				case "low":
					matchesFilter = averageScore < 50;
					break;
				default:
					matchesFilter = true;
			}

			return matchesSearch && matchesFilter;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "oldest":
					return (
						new Date(a.timestamp.replace(" ", "T")).getTime() -
						new Date(b.timestamp.replace(" ", "T")).getTime()
					);
				case "newest":
					return (
						new Date(b.timestamp.replace(" ", "T")).getTime() -
						new Date(a.timestamp.replace(" ", "T")).getTime()
					);
				case "name":
					return a.name.localeCompare(b.name);
				case "score": {
					const avgA =
						a.reports.reduce((acc, rep) => acc + (rep.score || 0), 0) /
						a.reports.length;
					const avgB =
						b.reports.reduce((acc, rep) => acc + (rep.score || 0), 0) /
						b.reports.length;
					return avgB - avgA;
				}
				case "pages":
					return b.reports.length - a.reports.length;
				default:
					return 0;
			}
		});

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

			{/* Filters and Search */}
			<div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="flex-1">
						<label
							htmlFor="search"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Search Reports
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
							<input
								type="text"
								id="search"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search by report name or URL..."
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					{/* Sort */}
					<div className="sm:w-48">
						<label
							htmlFor="sort"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Sort By
						</label>
						<select
							id="sort"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortOption)}
							className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="newest">Newest First</option>
							<option value="oldest">Oldest First</option>
							<option value="name">Name (A-Z)</option>
							<option value="score">Score (High to Low)</option>
							<option value="pages">Page Count</option>
						</select>
					</div>

					{/* Filter */}
					<div className="sm:w-48">
						<label
							htmlFor="filter"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Filter by Score
						</label>
						<select
							id="filter"
							value={filterBy}
							onChange={(e) => setFilterBy(e.target.value as FilterOption)}
							className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Reports</option>
							<option value="high">High (80-100)</option>
							<option value="medium">Medium (50-79)</option>
							<option value="low">Low (0-49)</option>
						</select>
					</div>
				</div>

				{/* Results count */}
				<div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
					Showing {filteredAndSortedReports.length} of {reports.length} reports
				</div>
			</div>

			{filteredAndSortedReports.length === 0 ? (
				<div className="text-center py-12">
					{reports.length === 0 ? (
						<>
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
						</>
					) : (
						<>
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
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
								No matching reports
							</h3>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Try adjusting your search or filter criteria
							</p>
							<div className="mt-6">
								<button
									type="button"
									onClick={() => {
										setSearchTerm("");
										setFilterBy("all");
									}}
									className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Clear Filters
								</button>
							</div>
						</>
					)}
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredAndSortedReports.map((report) => (
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
