"use client";

import { useState } from "react";

interface AnalysisConfig {
	name: string;
	urls: string[];
	reportsDir: string;
}

interface RunAnalysisModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (config: AnalysisConfig) => void;
}

export default function RunAnalysisModal({
	isOpen,
	onClose,
	onSubmit,
}: RunAnalysisModalProps) {
	const [config, setConfig] = useState<AnalysisConfig>({
		name: "",
		urls: [""],
		reportsDir: "reports",
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!config.name.trim() ||
			config.urls.filter((url) => url.trim()).length === 0
		) {
			return;
		}

		setIsLoading(true);
		try {
			await onSubmit({
				...config,
				urls: config.urls.filter((url) => url.trim()),
			});
			// Reset form
			setConfig({
				name: "",
				urls: [""],
				reportsDir: "reports",
			});
			onClose();
		} catch (error) {
			console.error("Failed to start analysis:", error);
			// Handle error (show toast, etc.)
		} finally {
			setIsLoading(false);
		}
	};

	const addUrlField = () => {
		setConfig((prev) => ({
			...prev,
			urls: [...prev.urls, ""],
		}));
	};

	const removeUrlField = (index: number) => {
		setConfig((prev) => ({
			...prev,
			urls: prev.urls.filter((_, i) => i !== index),
		}));
	};

	const updateUrl = (index: number, value: string) => {
		setConfig((prev) => ({
			...prev,
			urls: prev.urls.map((url, i) => (i === index ? value : url)),
		}));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/70 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
				<div className="mt-3">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Run New Analysis
						</h3>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Analysis Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Analysis Name *
							</label>
							<input
								type="text"
								id="name"
								required
								value={config.name}
								onChange={(e) =>
									setConfig((prev) => ({ ...prev, name: e.target.value }))
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
								placeholder="e.g., homepage-audit, product-pages"
							/>
						</div>

						{/* URLs */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								URLs to Analyze *
							</label>
							<div className="space-y-2">
								{config.urls.map((url, index) => (
									<div
										key={index.toString()}
										className="flex items-center space-x-2"
									>
										<input
											type="url"
											value={url}
											onChange={(e) => updateUrl(index, e.target.value)}
											className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
											placeholder="https://example.com"
										/>
										{config.urls.length > 1 && (
											<button
												type="button"
												onClick={() => removeUrlField(index)}
												className="text-red-500 hover:text-red-700"
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										)}
									</div>
								))}
								<button
									type="button"
									onClick={addUrlField}
									className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
									Add URL
								</button>
							</div>
						</div>

						{/* Reports Directory */}
						<div>
							<label
								htmlFor="reportsDir"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Reports Directory
							</label>
							<input
								type="text"
								id="reportsDir"
								value={config.reportsDir}
								onChange={(e) =>
									setConfig((prev) => ({ ...prev, reportsDir: e.target.value }))
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
								placeholder="reports"
							/>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Directory where reports will be saved (relative to CLI tool
								location)
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-end space-x-3 pt-4">
							<button
								type="button"
								onClick={onClose}
								disabled={isLoading}
								className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={
									isLoading ||
									!config.name.trim() ||
									config.urls.filter((url) => url.trim()).length === 0
								}
								className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<>
										<svg
											className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<title>Loading...</title>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Starting...
									</>
								) : (
									"Start Analysis"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
