"use client";

import { useState } from "react";
import ReportsOverview from "./components/ReportsOverview";
import RunAnalysisModal from "./components/RunAnalysisModal";

interface AnalysisConfig {
	name: string;
	urls: string[];
	reportsDir: string;
}

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleNewAnalysis = async (config: AnalysisConfig) => {
		try {
			// This would trigger the CLI tool to run a new analysis
			// For now, we'll just log the configuration
			console.log("Starting new analysis with config:", config);

			// In a real implementation, this would:
			// 1. Send a request to an API endpoint
			// 2. The API would execute the Rust CLI tool
			// 3. Show progress/status updates
			// 4. Refresh the reports list when complete

			// Placeholder implementation
			const response = await fetch("/api/run-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(config),
			});

			if (!response.ok) {
				throw new Error("Failed to start analysis");
			}

			// Show success message or redirect to status page
			alert(
				"Analysis started! It will appear in the reports list when complete.",
			);
		} catch (error) {
			console.error("Error starting analysis:", error);
			alert("Failed to start analysis. Please try again.");
			throw error;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 flex items-center justify-center select-none">
								<img src="/logo.png" alt="Logo" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
									Batch Analyzer
								</h1>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Lighthouse Performance Reports Dashboard
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<button
								type="button"
								onClick={() => setIsModalOpen(true)}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
										d="M12 4v16m8-8H4"
									/>
								</svg>
								New Analysis
							</button>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<ReportsOverview />
			</main>

			<RunAnalysisModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleNewAnalysis}
			/>
		</div>
	);
}
