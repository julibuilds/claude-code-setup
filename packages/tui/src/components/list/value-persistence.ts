/**
 * Value persistence utilities for dropdown components
 * Handles storing and retrieving dropdown values using localStorage
 */

export interface ValuePersistenceOptions {
	/** Unique identifier for the dropdown */
	id: string;
	/** Whether to persist the value */
	storeValue: boolean;
	/** Default value if no stored value exists */
	defaultValue?: string;
}

/**
 * Storage key prefix for dropdown values
 */
const STORAGE_PREFIX = "tui-dropdown-value-";

/**
 * Get the storage key for a dropdown
 */
function getStorageKey(id: string): string {
	return `${STORAGE_PREFIX}${id}`;
}

/**
 * Store a dropdown value in localStorage
 */
export function storeDropdownValue(id: string, value: string): void {
	try {
		const key = getStorageKey(id);
		localStorage.setItem(key, value);
	} catch (error) {
		// Silently fail if localStorage is not available or quota exceeded
		console.warn("Failed to store dropdown value:", error);
	}
}

/**
 * Retrieve a stored dropdown value from localStorage
 */
export function getStoredDropdownValue(id: string): string | null {
	try {
		const key = getStorageKey(id);
		return localStorage.getItem(key);
	} catch (error) {
		// Silently fail if localStorage is not available
		console.warn("Failed to retrieve dropdown value:", error);
		return null;
	}
}

/**
 * Clear a stored dropdown value from localStorage
 */
export function clearStoredDropdownValue(id: string): void {
	try {
		const key = getStorageKey(id);
		localStorage.removeItem(key);
	} catch (error) {
		// Silently fail if localStorage is not available
		console.warn("Failed to clear dropdown value:", error);
	}
}

/**
 * Get the initial value for a dropdown, considering stored value and defaults
 */
export function getInitialDropdownValue(options: ValuePersistenceOptions): string {
	const { id, storeValue, defaultValue = "" } = options;

	if (!storeValue) {
		return defaultValue;
	}

	const storedValue = getStoredDropdownValue(id);
	return storedValue ?? defaultValue;
}

/**
 * Handle value change with optional persistence
 */
export function handleDropdownValueChange(
	id: string,
	value: string,
	storeValue: boolean,
	onChange?: (newValue: string) => void
): void {
	// Store the value if persistence is enabled
	if (storeValue) {
		storeDropdownValue(id, value);
	}

	// Call the onChange callback
	if (onChange) {
		onChange(value);
	}
}
