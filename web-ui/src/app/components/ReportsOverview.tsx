"use client";

import { useEffect, useState } from "react";
import type { ReportCollection } from "../../types";
import ReportCard from "./ReportCard";
import ReportDetails from "./ReportDetails";

type SortOption = "newest" | "oldest" | "name" | "score" | "pages";
type FilterOption = "all" | "high" | "medium" | "low";

export default function ReportsOverview() {
	const [collections, setCollections] = useState<ReportCollection[]>([]);
	const [selectedCollection, setSelectedCollection] =
		useState<ReportCollection | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("newest");
	const [filterBy, setFilterBy] = useState<FilterOption>("all");

	useEffect(() => {
		fetchCollections();
	}, []);

	const fetchCollections = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/reports");
			if (!response.ok) {
				throw new Error("Failed to fetch reports");
			}
			const data = await response.json();
			setCollections(data.reports || []);
		} catch (err) {
			setError("Failed to load reports");
			console.error("Error fetching reports:", err);
		} finally {
			setLoading(false);
		}
	};

	// Filter and sort reports
	const filteredAndSortedCollections = collections
		.filter((collection) => {
			// Search filter
			const matchesSearch =
				searchTerm === "" ||
				collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				collection.urls.some((url: string) =>
					url.toLowerCase().includes(searchTerm.toLowerCase()),
				);

			// Score filter
			const averageScore = collection.lastRun?.avgScore ?? 0;
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
			const lastRunA = a.lastRun;
			const lastRunB = b.lastRun;

			if (!lastRunA || !lastRunB) return 0;

			switch (sortBy) {
				case "oldest":
					return (
						new Date(lastRunA.timestamp).getTime() -
						new Date(lastRunB.timestamp).getTime()
					);
				case "newest":
					return (
						new Date(lastRunB.timestamp).getTime() -
						new Date(lastRunA.timestamp).getTime()
					);
				case "name":
					return a.name.localeCompare(b.name);
				case "score":
					return (lastRunB.avgScore ?? 0) - (lastRunA.avgScore ?? 0);
				case "pages":
					return (
						(lastRunB.reports?.length ?? 0) - (lastRunA.reports?.length ?? 0)
					);
				default:
					return 0;
			}
		});

	const handleSelectCollection = (collection: ReportCollection) => {
		setSelectedCollection(collection);
	};

	const handleBack = () => {
		setSelectedCollection(null);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
				role="alert"
			>
				<strong className="font-bold">Error:</strong>
				<span className="block sm:inline"> {error}</span>
			</div>
		);
	}

	if (selectedCollection) {
		return (
			<ReportDetails collection={selectedCollection} onBack={handleBack} />
		);
	}

	return (
		<div>
			<div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
				{/* Search Input */}
				<div className="relative w-full sm:w-auto">
					<svg
						className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<title>Search Icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						placeholder="Search reports..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 dark:bg-gray-800 dark:border-gray-600"
					/>
				</div>

				<div className="flex items-center gap-4">
					{/* Filter Dropdown */}
					<div>
						<label htmlFor="filter" className="sr-only">
							Filter by score
						</label>
						<select
							id="filter"
							value={filterBy}
							onChange={(e) => setFilterBy(e.target.value as FilterOption)}
							className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
						>
							<option value="all">All Scores</option>
							<option value="high">High (80+)</option>
							<option value="medium">Medium (50-79)</option>
							<option value="low">Low (&lt;50)</option>
						</select>
					</div>

					{/* Sort Dropdown */}
					<div>
						<label htmlFor="sort" className="sr-only">
							Sort by
						</label>
						<select
							id="sort"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortOption)}
							className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
						>
							<option value="newest">Newest First</option>
							<option value="oldest">Oldest First</option>
							<option value="name">Name (A-Z)</option>
							<option value="score">Highest Score</option>
							<option value="pages">Most Pages</option>
						</select>
					</div>
				</div>
			</div>

			{filteredAndSortedCollections.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredAndSortedCollections.map((collection) => (
						<ReportCard
							key={collection.name}
							collection={collection}
							onSelect={() => handleSelectCollection(collection)}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">
						No reports found
					</h3>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Try adjusting your search or filter criteria.
					</p>
				</div>
			)}
		</div>
	);
}
