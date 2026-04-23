/**
 * StorageService provides a simple interface for managing application state
 * using the browser's localStorage. It allows for scoping state to specific keys,
 * subscribing to changes, and synchronizing state across multiple tabs.
 * 
 * The createStore function is a helper that creates a scoped store with default values.
 * 
 * Usage:
 *   const userSettingsStore = createStore('userSettings', { theme: 'light' });
 *   userSettingsStore.set({ theme: 'dark' });
 *   const settings = userSettingsStore.get();
 * 
 * Note: The state is persisted in localStorage under the key 'templateEditor.v1'.
 *       Be mindful of the size of the data you store, as localStorage has limitations.
 *       Also, consider the security implications of storing sensitive data in localStorage.
 *       This service does not implement any encryption or security measures for stored data.
 * 
 * The service also listens for 'storage' events to synchronize state across multiple tabs.
 * When the state changes in one tab, other tabs will receive the updated state and emit a change event.
 * 
 * The subscribe function allows components to listen for changes to the state. When the state changes,
 * the provided listener function will be called with the new state and the key that was changed.
 * 
 * The replaceState function can be used to replace the entire state object, which can be useful for resetting
 * or initializing the state from an external source.
 * 
 * The clear function removes all state and clears the corresponding localStorage entry.
 * 
 * Overall, this service provides a simple and effective way to manage application state with persistence and synchronization capabilities.
 */
const STORAGE_KEY = 'templateEditor.v1';

export const StorageService = (() => {
    let state = {};
    const listeners = new Set();

    function load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            state = JSON.parse(raw) || {};
        } catch (error) {
            console.warn('Corrupted state removed.', error);
            localStorage.removeItem(STORAGE_KEY);
            state = {};
        }
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Persist failed', error);
        }
    }

    function emit(key) {
        listeners.forEach((listener) => listener(state, key));
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function scope(key) {
        if (!key) {
            throw new Error('StorageService.scope requires a key');
        }

        return {
            get() {
                return state[key] ?? null;
            },

            set(value) {
                state[key] = value;
                persist();
                emit(key);
            },

            update(fn) {
                const prev = state[key] ?? null;
                const next = fn(prev);
                state[key] = next;
                persist();
                emit(key);
            },

            remove() {
                delete state[key];
                persist();
                emit(key);
            },
        };
    }

    function getState() {
        return state;
    }

    function replaceState(nextState) {
        state = nextState || {};
        persist();
        emit('*');
    }

    function clear() {
        state = {};
        localStorage.removeItem(STORAGE_KEY);
        emit('*');
    }

    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) {
            try {
                state = JSON.parse(event.newValue || '{}');
                emit('*');
            } catch {
                state = {};
            }
        }
    });

    load();

    return {
        scope,
        getState,
        replaceState,
        clear,
        subscribe,
    };
})();

export function createStore(key, defaults) {
    const store = StorageService.scope(key);

    return {
        get: () => store.get() ?? defaults,
        set: store.set,
        update: store.update,
    };
}

export default StorageService;