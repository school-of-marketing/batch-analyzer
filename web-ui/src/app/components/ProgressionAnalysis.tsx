import type { TooltipProps } from "recharts";
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

function CustomTooltip({
	active,
	payload,
	label,
}: TooltipProps<number, string>) {
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
				{data.info && (
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
		</div>
	);
}
