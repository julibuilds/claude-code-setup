/**
 * Environment variable interpolation utility
 * Supports both $VAR and ${VAR} syntax
 */

/**
 * Recursively interpolate environment variables in configuration
 * Supports both $VAR_NAME and ${VAR_NAME} syntax
 *
 * @param obj - The object to interpolate
 * @returns The object with environment variables replaced
 *
 * @example
 * ```typescript
 * const config = {
 *   apiKey: "$API_KEY",
 *   url: "${BASE_URL}/api"
 * };
 * const interpolated = interpolateEnvVars(config);
 * // { apiKey: "actual-key", url: "https://example.com/api" }
 * ```
 */
export function interpolateEnvVars(obj: any): any {
	// Handle string values - replace environment variables
	if (typeof obj === "string") {
		return obj.replace(/\$\{?([A-Z_][A-Z0-9_]*)\}?/g, (_, varName) => {
			return process.env[varName] || "";
		});
	}

	// Handle arrays - recursively interpolate each element
	if (Array.isArray(obj)) {
		return obj.map(interpolateEnvVars);
	}

	// Handle objects - recursively interpolate each property
	if (obj && typeof obj === "object") {
		const result: any = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = interpolateEnvVars(value);
		}
		return result;
	}

	// Return primitive values as-is
	return obj;
}
