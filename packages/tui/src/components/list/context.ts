import { createContext, type ReactNode } from "react";
import { createDescendants } from "../../utils/descendants";
import type { DropdownItemDescendant, ListItemDescendant, ListSectionContextValue } from "./types";

// List context for passing data to dropdown
export interface ListContextValue {
	isDropdownOpen: boolean;
	setIsDropdownOpen: (value: boolean) => void;
	openDropdown: () => void;
	selectedIndex: number;
	setSelectedIndex?: (index: number) => void;
	searchText: string;
	isFiltering: boolean;
	setCurrentDetail?: (detail: ReactNode) => void;
	isShowingDetail?: boolean;
}

export const ListContext = createContext<ListContextValue | undefined>(undefined);

// Dropdown context for passing data to dropdown items
export interface DropdownContextValue {
	currentSection?: string;
	selectedIndex?: number;
	setSelectedIndex?: (index: number) => void;
	currentValue?: string;
	searchText?: string;
	onChange?: (value: string) => void;
	isFiltering?: boolean;
}

export const DropdownContext = createContext<DropdownContextValue | undefined>(undefined);

// Create descendants for List items
export const {
	DescendantsProvider: ListDescendantsProvider,
	useDescendants: useListDescendants,
	useDescendant: useListItemDescendant,
} = createDescendants<ListItemDescendant>();

// Create descendants for Dropdown items
export const {
	DescendantsProvider: DropdownDescendantsProvider,
	useDescendants: useDropdownDescendants,
	useDescendant: useDropdownItemDescendant,
} = createDescendants<DropdownItemDescendant>();

// Context for passing section state to items
export const ListSectionContext = createContext<ListSectionContextValue>({});
