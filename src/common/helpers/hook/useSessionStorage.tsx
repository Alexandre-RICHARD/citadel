import { useCallback, useEffect, useState } from "react";

type UseSessionStorageReturn<T> = {
	value: T | null;
	set: (value: T) => void;
	remove: () => void;
};

type SessionStorageCustomEventDetail<T> = {
	key: string;
	value: T | null;
};

const standardSessionEvent = "storage";
const customSessionEvent = "session-storage-change";

export function useSessionStorage<T>(
	key: string,
	defaultValue: T | null,
): UseSessionStorageReturn<T> {
	const readValue = useCallback((): T | null => {
		if (typeof window === "undefined") return defaultValue;

		try {
			const item = sessionStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : defaultValue;
		} catch {
			return defaultValue;
		}
	}, [key, defaultValue]);

	const [value, setValue] = useState<T | null>(readValue);

	const set = useCallback(
		(newValue: T) => {
			setValue(newValue);
			sessionStorage.setItem(key, JSON.stringify(newValue));

			const customEvent = new CustomEvent<SessionStorageCustomEventDetail<T>>(
				customSessionEvent,
				{
					detail: { key, value: newValue },
				},
			);

			window.dispatchEvent(customEvent);
		},
		[key],
	);

	const remove = useCallback(() => {
		setValue(defaultValue);
		sessionStorage.removeItem(key);

		const customEvent = new CustomEvent<
			SessionStorageCustomEventDetail<T | null>
		>(customSessionEvent, {
			detail: { key, value: defaultValue },
		});

		window.dispatchEvent(customEvent);
	}, [key, defaultValue]);

	useEffect(() => {
		const handleStorageChange = (event: Event) => {
			if (event.type === customSessionEvent) {
				const customEvent = event as CustomEvent<
					SessionStorageCustomEventDetail<T>
				>;

				if (customEvent.detail.key === key) {
					setValue(customEvent.detail.value);
				}

				return;
			}

			if (event.type === standardSessionEvent) {
				const storageEvent = event as StorageEvent;

				if (
					storageEvent.storageArea === sessionStorage &&
					storageEvent.key === key
				) {
					setValue(readValue());
				}
			}
		};

		window.addEventListener(standardSessionEvent, handleStorageChange);
		window.addEventListener(
			customSessionEvent,
			handleStorageChange as EventListener,
		);

		return () => {
			window.removeEventListener(standardSessionEvent, handleStorageChange);
			window.removeEventListener(
				customSessionEvent,
				handleStorageChange as EventListener,
			);
		};
	}, [key, readValue]);

	return { value, set, remove };
}
