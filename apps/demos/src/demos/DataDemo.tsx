import { faker } from "@faker-js/faker";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { type Column, Table, Tabs, useThemeColors } from "@repo/tui";
import { useMemo, useState } from "react";

interface User {
	id: string;
	name: string;
	email: string;
	status: "active" | "inactive" | "pending";
	score: number;
}

export function DataDemo() {
	const colors = useThemeColors();
	const [selectedRow, setSelectedRow] = useState(0);
	const [activeTab, setActiveTab] = useState(0);

	// Generate fake data
	const users = useMemo<User[]>(
		() =>
			Array.from({ length: 20 }, (_, i) => ({
				id: faker.string.uuid(),
				name: faker.person.fullName(),
				email: faker.internet.email(),
				status: faker.helpers.arrayElement(["active", "inactive", "pending"] as const),
				score: faker.number.int({ min: 0, max: 100 }),
			})),
		[]
	);

	const columns: Column<User>[] = [
		{
			id: "name",
			label: "Name",
			style: { width: 20, truncate: true },
			cell: (user, isSelected) => (
				<text
					fg={isSelected ? colors.accent.primary : colors.text.primary}
					attributes={isSelected ? TextAttributes.BOLD : undefined}
				>
					{user.name}
				</text>
			),
		},
		{
			id: "email",
			label: "Email",
			style: { width: 30, truncate: true },
			cell: (user, isSelected) => (
				<text fg={isSelected ? colors.accent.secondary : colors.text.muted}>{user.email}</text>
			),
		},
		{
			id: "status",
			label: "Status",
			style: { width: 10, align: "center" },
			cell: (user, isSelected) => {
				const statusColor =
					user.status === "active"
						? colors.status.success
						: user.status === "inactive"
							? colors.status.error
							: colors.status.warning;
				return (
					<text fg={statusColor} attributes={TextAttributes.BOLD}>
						{user.status.toUpperCase()}
					</text>
				);
			},
		},
		{
			id: "score",
			label: "Score",
			style: { width: 8, align: "flex-end" },
			cell: (user, isSelected) => {
				const scoreColor =
					user.score >= 70
						? colors.status.success
						: user.score >= 40
							? colors.status.warning
							: colors.status.error;
				return (
					<text fg={scoreColor} attributes={isSelected ? TextAttributes.BOLD : undefined}>
						{user.score}
					</text>
				);
			},
		},
	];

	useKeyboard((key) => {
		if (key.name === "up") {
			setSelectedRow((prev) => Math.max(0, prev - 1));
		}
		if (key.name === "down") {
			setSelectedRow((prev) => Math.min(users.length - 1, prev + 1));
		}
		if (key.name === "left") {
			setActiveTab((prev) => Math.max(0, prev - 1));
		}
		if (key.name === "right") {
			setActiveTab((prev) => Math.min(2, prev + 1));
		}
	});

	const selectedUser = users[selectedRow];

	return (
		<box flexGrow={1} style={{ padding: 2, flexDirection: "column", gap: 1 }}>
			<box alignItems="center">
				<ascii-font font="tiny" text="Data Display" />
			</box>

			<box style={{ flexDirection: "row", gap: 2, flexGrow: 1 }}>
				{/* Left: Table */}
				<box style={{ flexDirection: "column", flexGrow: 2 }}>
					<box border title="User Database" style={{ padding: 1, height: 25 }}>
						<Table
							columns={columns}
							data={users}
							selectedIndex={selectedRow}
							getItemKey={(user) => user.id}
							renderSelectionIndicator={(isSelected) => (
								<text fg={colors.accent.primary}>{isSelected ? "▶" : " "}</text>
							)}
						/>
					</box>
					<box style={{ paddingTop: 1 }}>
						<text fg={colors.text.muted}>↑/↓ Navigate rows • ←/→ Switch tabs</text>
					</box>
				</box>

				{/* Right: Details with Tabs */}
				<box style={{ flexDirection: "column", flexGrow: 1, gap: 1 }}>
					<box border title="User Details" style={{ padding: 1 }}>
						<Tabs
							tabs={[
								{
									id: "info",
									label: "Info",
									content: (
										<box style={{ flexDirection: "column", gap: 1, paddingTop: 1 }}>
											{selectedUser && (
												<box style={{ flexDirection: "column", gap: 1 }}>
													<box border style={{ padding: 1 }}>
														<box style={{ flexDirection: "column", gap: 0 }}>
															<text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
																{selectedUser.name}
															</text>
															<text fg={colors.text.muted}>{selectedUser.email}</text>
															<box style={{ paddingTop: 1 }}>
																<text fg={colors.text.secondary}>
																	ID: {selectedUser.id.slice(0, 8)}...
																</text>
															</box>
														</box>
													</box>
												</box>
											)}
										</box>
									),
								},
								{
									id: "stats",
									label: "Stats",
									content: (
										<box style={{ flexDirection: "column", gap: 1, paddingTop: 1 }}>
											{selectedUser && (
												<box border style={{ padding: 1 }}>
													<box style={{ flexDirection: "column", gap: 1 }}>
														<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
															<text fg={colors.text.muted}>Score:</text>
															<text
																fg={
																	selectedUser.score >= 70
																		? colors.status.success
																		: selectedUser.score >= 40
																			? colors.status.warning
																			: colors.status.error
																}
																attributes={TextAttributes.BOLD}
															>
																{selectedUser.score}/100
															</text>
														</box>
														<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
															<text fg={colors.text.muted}>Status:</text>
															<text
																fg={
																	selectedUser.status === "active"
																		? colors.status.success
																		: selectedUser.status === "inactive"
																			? colors.status.error
																			: colors.status.warning
																}
															>
																{selectedUser.status}
															</text>
														</box>
														<box style={{ paddingTop: 1 }}>
															<text fg={colors.text.muted}>Progress:</text>
															<box style={{ flexDirection: "row" }}>
																<text fg={colors.accent.primary}>
																	{"█".repeat(Math.floor(selectedUser.score / 5))}
																</text>
																<text fg={colors.border.default}>
																	{"░".repeat(20 - Math.floor(selectedUser.score / 5))}
																</text>
															</box>
														</box>
													</box>
												</box>
											)}
										</box>
									),
								},
								{
									id: "activity",
									label: "Activity",
									content: (
										<box style={{ flexDirection: "column", gap: 1, paddingTop: 1 }}>
											<box border style={{ padding: 1 }}>
												<box style={{ flexDirection: "column", gap: 0 }}>
													<text fg={colors.text.muted}>• Logged in 2h ago</text>
													<text fg={colors.text.muted}>• Updated profile 1d ago</text>
													<text fg={colors.text.muted}>• Completed task 3d ago</text>
													<text fg={colors.text.muted}>• Joined team 1w ago</text>
												</box>
											</box>
										</box>
									),
								},
							]}
							activeTab={["info", "stats", "activity"][activeTab]}
							onChange={(tabId) => {
								const index = ["info", "stats", "activity"].indexOf(tabId);
								if (index !== -1) setActiveTab(index);
							}}
						></Tabs>
					</box>

					{/* Stats Cards */}
					<box style={{ flexDirection: "column", gap: 1 }}>
						<box border title="Total Users" style={{ padding: 1 }}>
							<text fg={colors.status.success} attributes={TextAttributes.BOLD}>
								{users.length}
							</text>
						</box>
						<box border title="Active" style={{ padding: 1 }}>
							<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
								{users.filter((u) => u.status === "active").length}
							</text>
						</box>
						<box border title="Avg Score" style={{ padding: 1 }}>
							<text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
								{Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length)}
							</text>
						</box>
					</box>
				</box>
			</box>
		</box>
	);
}
