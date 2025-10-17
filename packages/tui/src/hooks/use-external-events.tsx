import type { EventEmitter } from "events";
import { useEffect } from "react";

/**
 * Generic event handler type
 */
export type EventHandler<T = any> = (data: T) => void;

/**
 * Event subscription configuration
 */
export interface EventSubscription<T = any> {
	/** Event name to subscribe to */
	event: string;
	/** Handler function for the event */
	handler: EventHandler<T>;
}

/**
 * Hook to subscribe to external events from an event emitter
 *
 * Useful for TUIs that wrap backend services and need to sync state
 * with external events (e.g., server updates, log entries, etc.)
 *
 * @param emitter - The event emitter to subscribe to
 * @param subscriptions - Array of event subscriptions
 *
 * @example
 * ```tsx
 * // Define typed actions
 * type Action =
 *   | { type: 'server_added'; server: Server }
 *   | { type: 'log_entry'; entry: LogEntry };
 *
 * // Subscribe to events
 * useExternalEvents(serverEmitter, [
 *   {
 *     event: 'action',
 *     handler: (action: Action) => {
 *       if (action.type === 'server_added') {
 *         setServers(prev => [...prev, action.server]);
 *       } else if (action.type === 'log_entry') {
 *         addLog(action.entry);
 *       }
 *     }
 *   }
 * ]);
 * ```
 */
export function useExternalEvents<TEmitter extends EventEmitter = EventEmitter>(
	emitter: TEmitter | null | undefined,
	subscriptions: EventSubscription[]
): void {
	useEffect(() => {
		if (!emitter) return;

		// Subscribe to all events
		for (const subscription of subscriptions) {
			emitter.on(subscription.event, subscription.handler);
		}

		// Cleanup on unmount
		return () => {
			for (const subscription of subscriptions) {
				emitter.off(subscription.event, subscription.handler);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [emitter, ...subscriptions.map((s) => s.event)]);
}

/**
 * Simpler version for single event subscription
 *
 * @example
 * ```tsx
 * useExternalEvent(emitter, 'update', (data) => {
 *   console.log('Update received:', data);
 * });
 * ```
 */
export function useExternalEvent<T = any>(
	emitter: EventEmitter | null | undefined,
	event: string,
	handler: EventHandler<T>
): void {
	useExternalEvents(emitter, [{ event, handler }]);
}

/**
 * Action-based event system types for typed event-driven architecture
 */
export interface Action<TType extends string = string, TPayload = any> {
	type: TType;
	payload?: TPayload;
}

/**
 * Action handler map for typed action dispatching
 */
export type ActionHandlerMap<TAction extends Action> = {
	[K in TAction["type"]]: (action: Extract<TAction, { type: K }>) => void;
};

/**
 * Hook for action-based event systems with type-safe handlers
 *
 * @example
 * ```tsx
 * type AppAction =
 *   | { type: 'user_login'; payload: { userId: string } }
 *   | { type: 'user_logout'; payload: { userId: string } }
 *   | { type: 'data_update'; payload: { data: any[] } };
 *
 * useActionEvents(emitter, 'action', {
 *   'user_login': (action) => {
 *     console.log('User logged in:', action.payload.userId);
 *   },
 *   'user_logout': (action) => {
 *     console.log('User logged out:', action.payload.userId);
 *   },
 *   'data_update': (action) => {
 *     setData(action.payload.data);
 *   }
 * });
 * ```
 */
export function useActionEvents<TAction extends Action>(
	emitter: EventEmitter | null | undefined,
	actionEvent: string,
	handlers: Partial<ActionHandlerMap<TAction>>
): void {
	useEffect(() => {
		if (!emitter) return;

		const handleAction = (action: TAction) => {
			const handler = handlers[action.type as keyof typeof handlers];
			if (handler) {
				handler(action as any);
			}
		};

		emitter.on(actionEvent, handleAction);

		return () => {
			emitter.off(actionEvent, handleAction);
		};
	}, [emitter, actionEvent, handlers]);
}
