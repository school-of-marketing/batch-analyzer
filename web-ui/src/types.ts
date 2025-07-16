// A single report file (e.g., page_....html)
export interface ReportFile {
	filename: string;
	url?: string;
	score?: number;
	metrics?: {
		performance?: number;
		accessibility?: number;
		bestPractices?: number;
		seo?: number;
	};
}

// A single analysis run (a directory in `reports`)
export interface ReportRun {
	name: string; // The base name of the analysis
	timestamp: string;
	full_name: string; // The full directory name
	reports: ReportFile[];
	avgScore?: number;
}

// A collection of runs with the same base name
export interface ReportCollection {
	name: string;
	urls: string[]; // URLs should be consistent across runs
	runs: ReportRun[];
	lastRun?: ReportRun;
}
