/**
 * Utility functions for handling URLs, including Arabic URL decoding
 */

/**
 * Decodes URL-encoded Arabic text and other special characters
 * @param url - The URL to decode
 * @returns Decoded URL with readable Arabic text
 */
export function decodeArabicUrl(url: string): string {
	try {
		return decodeURIComponent(url);
	} catch (e) {
		// If decoding fails, return the original URL
		console.warn(`Failed to decode URL: ${url}`, e);
		return url;
	}
}

/**
 * Gets a human-readable display version of a URL
 * Removes protocol and www prefix for cleaner display
 * @param url - The URL to format
 * @returns Formatted URL for display
 */
export function getDisplayUrl(url: string): string {
	try {
		const decoded = decodeArabicUrl(url);
		// Remove protocol and www for cleaner display
		return decoded
			.replace(/^https?:\/\//, "")
			.replace(/^www\./, "")
			.replace(/\/$/, ""); // Remove trailing slash
	} catch {
		return url;
	}
}

/**
 * Extracts the page name from a URL path
 * Useful for displaying page titles from Arabic URLs
 * @param url - The URL to extract page name from
 * @returns Page name or path
 */
export function getPageName(url: string): string {
	try {
		const decoded = decodeArabicUrl(url);
		const urlObj = new URL(decoded);
		const pathname = urlObj.pathname;

		// If it's the root path
		if (pathname === "/" || pathname === "") {
			return "Home";
		}

		// Get the last segment of the path
		const segments = pathname.split("/").filter(Boolean);
		const lastSegment = segments[segments.length - 1];

		// If the last segment looks like a slug, try to make it readable
		if (lastSegment) {
			return lastSegment
				.replace(/-/g, " ")
				.replace(/_/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase());
		}

		return pathname;
	} catch {
		// Fallback: try to extract from the original URL
		const parts = url.split("/").filter(Boolean);
		const lastPart = parts[parts.length - 1];
		return lastPart || "Page";
	}
}

/**
 * Checks if a URL contains Arabic characters
 * @param url - The URL to check
 * @returns True if the URL contains Arabic characters
 */
export function hasArabicContent(url: string): boolean {
	const decoded = decodeArabicUrl(url);
	// Arabic Unicode range: \u0600-\u06FF
	return /[\u0600-\u06FF]/.test(decoded);
}
