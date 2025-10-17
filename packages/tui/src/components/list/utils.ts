// Helper function to determine if an item should be visible based on search
export function shouldItemBeVisible(
	searchQuery: string,
	props: {
		title: string;
		subtitle?: string;
		keywords?: string[];
	}
): boolean {
	// If no search query, show all items
	if (!searchQuery.trim()) return true;

	const needle = searchQuery.toLowerCase().trim();
	const searchableText = [props.title, props.subtitle, ...(props.keywords || [])]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();

	return searchableText.includes(needle);
}
