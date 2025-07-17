import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { ReportCollection } from "../../types";

interface ProgressionAnalysisProps {
	collection: ReportCollection;
	selectedUrl: string | null;
}

interface ChartDataPoint {
	name: string;
	performance: number;
	accessibility: number;
	bestPractices: number;
	seo: number;
	overall: number;
	info?: string;
}

function ProgressionChart({ data }: { data: ChartDataPoint[] }) {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<LineChart
				data={data}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis
					dataKey="name"
					tickFormatter={(timestamp: string) =>
						new Date(timestamp).toLocaleDateString()
					}
				/>
				<YAxis domain={[0, 100]} />
				<Tooltip
					content={<CustomTooltip />}
					labelFormatter={(timestamp: string) =>
						new Date(timestamp).toLocaleString()
					}
				/>
				<Legend />
				<Line
					type="monotone"
					dataKey="performance"
					stroke="#8884d8"
					activeDot={{ r: 8 }}
				/>
				<Line type="monotone" dataKey="accessibility" stroke="#82ca9d" />
				<Line type="monotone" dataKey="bestPractices" stroke="#ffc658" />
				<Line type="monotone" dataKey="seo" stroke="#ff8042" />
			</LineChart>
		</ResponsiveContainer>
	);
}

interface TooltipPayload {
	dataKey: string;
	name: string;
	value: number;
	color: string;
	payload?: ChartDataPoint;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: TooltipPayload[];
	label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
				<p className="label font-bold">
					{new Date(label || "").toLocaleString()}
				</p>
				{payload.map((pld) => (
					<p
						key={pld.dataKey}
						style={{ color: pld.color }}
						className="intro"
					>{`${pld.name}: ${pld.value}`}</p>
				))}
				{data?.info && (
					<pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
						{data.info}
					</pre>
				)}
			</div>
		);
	}

	return null;
}

export default function ProgressionAnalysis({
	collection,
	selectedUrl,
}: ProgressionAnalysisProps) {
	if (!selectedUrl) {
		return (
			<div className="text-center py-12">
				<h3 className="text-lg font-medium text-gray-900 dark:text-white">
					Select a Page to View Progression
				</h3>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Click on a URL in the table above to see its performance trend over
					time.
				</p>
			</div>
		);
	}

	const progressionData: ChartDataPoint[] = collection.runs
		.map((run): ChartDataPoint | null => {
			const report = run.reports.find((r) => r.url === selectedUrl);
			if (!report) return null;
			return {
				name: run.timestamp,
				performance: report.metrics?.performance ?? 0,
				accessibility: report.metrics?.accessibility ?? 0,
				bestPractices: report.metrics?.bestPractices ?? 0,
				seo: report.metrics?.seo ?? 0,
				overall: report.score ?? 0,
				info: run.info,
			};
		})
		.filter((data): data is ChartDataPoint => data !== null)
		.reverse(); // oldest to newest

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">
				Progression for:{" "}
				<span className="font-normal text-gray-700 dark:text-gray-300">
					{selectedUrl}
				</span>
			</h2>
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				{progressionData.length > 1 ? (
					<ProgressionChart data={progressionData} />
				) : (
					<div className="text-center py-8">
						<p>Not enough data to display progression.</p>
					</div>
				)}
			</div>

			{progressionData.length > 0 && (
				<div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<h3 className="text-lg font-semibold mb-4">Performance History</h3>
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className="px-6 py-3">
										Date
									</th>
									<th scope="col" className="px-6 py-3">
										Performance
									</th>
									<th scope="col" className="px-6 py-3">
										Accessibility
									</th>
									<th scope="col" className="px-6 py-3">
										Best Practices
									</th>
									<th scope="col" className="px-6 py-3">
										SEO
									</th>
									<th scope="col" className="px-6 py-3">
										Overall
									</th>
									<th scope="col" className="px-6 py-3">
										Info
									</th>
								</tr>
							</thead>
							<tbody>
								{progressionData.map((data, index) => {
									const isFirst = index === 0;
									const firstData = progressionData[0];
									const performanceDiff = isFirst
										? 0
										: data.performance - firstData.performance;
									const accessibilityDiff = isFirst
										? 0
										: data.accessibility - firstData.accessibility;
									const bestPracticesDiff = isFirst
										? 0
										: data.bestPractices - firstData.bestPractices;
									const seoDiff = isFirst ? 0 : data.seo - firstData.seo;
									const overallDiff = isFirst
										? 0
										: data.overall - firstData.overall;

									return (
										<tr
											key={data.name}
											className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
										>
											<td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
												{new Date(data.name).toLocaleDateString()}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															data.performance >= 90
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
																: data.performance >= 70
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
																	: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
														}`}
													>
														{data.performance}
													</span>
													{!isFirst && (
														<span
															className={`text-xs ${
																performanceDiff > 0
																	? "text-green-600 dark:text-green-400"
																	: performanceDiff < 0
																		? "text-red-600 dark:text-red-400"
																		: "text-gray-500 dark:text-gray-400"
															}`}
														>
															{performanceDiff > 0 ? "+" : ""}
															{performanceDiff}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															data.accessibility >= 90
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
																: data.accessibility >= 70
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
																	: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
														}`}
													>
														{data.accessibility}
													</span>
													{!isFirst && (
														<span
															className={`text-xs ${
																accessibilityDiff > 0
																	? "text-green-600 dark:text-green-400"
																	: accessibilityDiff < 0
																		? "text-red-600 dark:text-red-400"
																		: "text-gray-500 dark:text-gray-400"
															}`}
														>
															{accessibilityDiff > 0 ? "+" : ""}
															{accessibilityDiff}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															data.bestPractices >= 90
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
																: data.bestPractices >= 70
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
																	: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
														}`}
													>
														{data.bestPractices}
													</span>
													{!isFirst && (
														<span
															className={`text-xs ${
																bestPracticesDiff > 0
																	? "text-green-600 dark:text-green-400"
																	: bestPracticesDiff < 0
																		? "text-red-600 dark:text-red-400"
																		: "text-gray-500 dark:text-gray-400"
															}`}
														>
															{bestPracticesDiff > 0 ? "+" : ""}
															{bestPracticesDiff}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															data.seo >= 90
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
																: data.seo >= 70
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
																	: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
														}`}
													>
														{data.seo}
													</span>
													{!isFirst && (
														<span
															className={`text-xs ${
																seoDiff > 0
																	? "text-green-600 dark:text-green-400"
																	: seoDiff < 0
																		? "text-red-600 dark:text-red-400"
																		: "text-gray-500 dark:text-gray-400"
															}`}
														>
															{seoDiff > 0 ? "+" : ""}
															{seoDiff}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															data.overall >= 90
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
																: data.overall >= 70
																	? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
																	: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
														}`}
													>
														{data.overall}
													</span>
													{!isFirst && (
														<span
															className={`text-xs ${
																overallDiff > 0
																	? "text-green-600 dark:text-green-400"
																	: overallDiff < 0
																		? "text-red-600 dark:text-red-400"
																		: "text-gray-500 dark:text-gray-400"
															}`}
														>
															{overallDiff > 0 ? "+" : ""}
															{overallDiff}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												{data.info && (
													<div className="max-w-xs truncate text-gray-500 dark:text-gray-400">
														{data.info}
													</div>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
