/**
 * StorageService persists editor state and uploaded assets using IndexedDB.
 * Key-value application state is cached in memory after initialization, while
 * heavier binary assets are stored in a dedicated object store.
 */
const DATABASE_NAME = 'TemplateEditor';
const DATABASE_VERSION = 1;
const DATA_STORE_NAME = 'data';
const ASSET_STORE_NAME = 'assets';

/**
 * Opens the editor database and creates the required object stores.
 * @returns {Promise<IDBDatabase>} - Open database handle.
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.addEventListener('upgradeneeded', () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(DATA_STORE_NAME)) {
                database.createObjectStore(DATA_STORE_NAME);
            }

            if (!database.objectStoreNames.contains(ASSET_STORE_NAME)) {
                database.createObjectStore(ASSET_STORE_NAME, {
                    keyPath: 'id',
                });
            }
        });

        request.addEventListener('success', () => {
            resolve(request.result);
        });

        request.addEventListener('error', () => {
            reject(request.error || new Error('Failed to open IndexedDB.'));
        });
    });
}

/**
 * Wraps a transaction request in a promise.
 * @param {IDBRequest} request - Request to resolve.
 * @returns {Promise<*>} - Request result.
 */
function waitForRequest(request) {
    return new Promise((resolve, reject) => {
        request.addEventListener('success', () => resolve(request.result));
        request.addEventListener('error', () => {
            reject(request.error || new Error('IndexedDB request failed.'));
        });
    });
}

/**
 * Waits for a transaction to complete.
 * @param {IDBTransaction} transaction - Transaction to observe.
 * @returns {Promise<void>} - Completion promise.
 */
function waitForTransaction(transaction) {
    return new Promise((resolve, reject) => {
        transaction.addEventListener('complete', () => resolve());
        transaction.addEventListener('error', () => {
            reject(transaction.error || new Error('IndexedDB transaction failed.'));
        });
        transaction.addEventListener('abort', () => {
            reject(transaction.error || new Error('IndexedDB transaction aborted.'));
        });
    });
}

/**
 * Creates a stable asset identifier.
 * @returns {string} - Asset identifier.
 */
function createAssetId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Collects asset references from a persisted snapshot value.
 * @param {*} value - Value to inspect.
 * @param {Set<string>} [assetIds] - Target id set.
 * @returns {Set<string>} - Collected asset ids.
 */
function collectAssetIds(value, assetIds = new Set()) {
    if (!value || typeof value !== 'object') {
        return assetIds;
    }

    if (Array.isArray(value)) {
        value.forEach((entry) => collectAssetIds(entry, assetIds));
        return assetIds;
    }

    if (typeof value.assetId === 'string' && value.assetId.trim() !== '') {
        assetIds.add(value.assetId);
    }

    Object.values(value).forEach((entry) => collectAssetIds(entry, assetIds));

    return assetIds;
}

export const StorageService = (() => {
    let databasePromise = null;
    let initializationPromise = null;
    let state = {};
    const listeners = new Set();
    const assetUrlCache = new Map();

    /**
     * Returns the open database handle.
     * @returns {Promise<IDBDatabase>} - Open database.
     */
    function getDatabase() {
        if (!databasePromise) {
            databasePromise = openDatabase();
        }

        return databasePromise;
    }

    /**
     * Reads all persisted key-value records into memory.
     * @returns {Promise<void>} - Completion promise.
     */
    async function loadState() {
        const database = await getDatabase();
        const transaction = database.transaction(DATA_STORE_NAME, 'readonly');
        const store = transaction.objectStore(DATA_STORE_NAME);
        const nextState = {};

        await new Promise((resolve, reject) => {
            const request = store.openCursor();

            request.addEventListener('success', () => {
                const cursor = request.result;

                if (!cursor) {
                    resolve();
                    return;
                }

                nextState[cursor.key] = cursor.value;
                cursor.continue();
            });

            request.addEventListener('error', () => {
                reject(request.error || new Error('Failed to read persisted state.'));
            });
        });

        await waitForTransaction(transaction);
        state = nextState;
    }

    /**
     * Ensures the in-memory cache has been initialized from IndexedDB.
     * @returns {Promise<void>} - Completion promise.
     */
    async function init() {
        if (!initializationPromise) {
            initializationPromise = loadState().catch((error) => {
                initializationPromise = null;
                throw error;
            });
        }

        await initializationPromise;
    }

    /**
     * Emits a change notification for a cache key.
     * @param {string} key - Changed key.
     * @returns {void}
     */
    function emit(key) {
        listeners.forEach((listener) => listener(state, key));
    }

    /**
     * Returns whether an asset is referenced by any persisted snapshot.
     * @param {string} assetId - Asset identifier.
     * @returns {boolean} - Whether asset is still referenced.
     */
    function isAssetReferenced(assetId) {
        return Object.values(state).some((entry) => collectAssetIds(entry).has(assetId));
    }

    /**
     * Removes cached object URLs for an asset.
     * @param {string} assetId - Asset identifier.
     * @returns {void}
     */
    function revokeAssetUrl(assetId) {
        const objectUrl = assetUrlCache.get(assetId);

        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            assetUrlCache.delete(assetId);
        }
    }

    /**
     * Deletes an asset record from IndexedDB.
     * @param {string} assetId - Asset identifier.
     * @returns {Promise<void>} - Completion promise.
     */
    async function deleteAssetRecord(assetId) {
        if (!assetId) {
            return;
        }

        revokeAssetUrl(assetId);

        const database = await getDatabase();
        const transaction = database.transaction(ASSET_STORE_NAME, 'readwrite');

        transaction.objectStore(ASSET_STORE_NAME).delete(assetId);
        await waitForTransaction(transaction);
    }

    /**
     * Deletes asset records that are no longer referenced by any snapshot.
     * @param {Iterable<string>} assetIds - Candidate asset ids.
     * @returns {Promise<void>} - Completion promise.
     */
    async function cleanupUnreferencedAssets(assetIds) {
        const deletions = [];

        for (const assetId of assetIds) {
            if (!isAssetReferenced(assetId)) {
                deletions.push(deleteAssetRecord(assetId));
            }
        }

        await Promise.all(deletions);
    }

    /**
     * Persists a single cache entry to IndexedDB.
     * @param {string} key - Cache key.
     * @param {*} value - Value to persist.
     * @returns {Promise<void>} - Completion promise.
     */
    async function persistValue(key, value) {
        const database = await getDatabase();
        const transaction = database.transaction(DATA_STORE_NAME, 'readwrite');

        transaction.objectStore(DATA_STORE_NAME).put(value, key);
        await waitForTransaction(transaction);
    }

    /**
     * Removes a persisted cache entry from IndexedDB.
     * @param {string} key - Cache key.
     * @returns {Promise<void>} - Completion promise.
     */
    async function removeValue(key) {
        const database = await getDatabase();
        const transaction = database.transaction(DATA_STORE_NAME, 'readwrite');

        transaction.objectStore(DATA_STORE_NAME).delete(key);
        await waitForTransaction(transaction);
    }

    /**
     * Replaces all persisted state records.
     * @param {object} nextState - Next full state object.
     * @returns {Promise<void>} - Completion promise.
     */
    async function replacePersistedState(nextState) {
        const database = await getDatabase();
        const transaction = database.transaction(DATA_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(DATA_STORE_NAME);

        store.clear();

        Object.entries(nextState).forEach(([key, value]) => {
            store.put(value, key);
        });

        await waitForTransaction(transaction);
    }

    /**
     * Persists a new uploaded asset and returns its identifier.
     * @param {Blob|File} blob - Uploaded image blob.
     * @returns {Promise<object>} - Stored asset descriptor.
     */
    async function saveAsset(blob) {
        if (!(blob instanceof Blob)) {
            throw new Error('StorageService.saveAsset requires a Blob or File.');
        }

        const assetId = createAssetId();
        const assetRecord = {
            id: assetId,
            blob,
            name: blob instanceof File ? blob.name : '',
            type: blob.type || 'application/octet-stream',
            updatedAt: Date.now(),
        };
        const database = await getDatabase();
        const transaction = database.transaction(ASSET_STORE_NAME, 'readwrite');

        transaction.objectStore(ASSET_STORE_NAME).put(assetRecord);
        await waitForTransaction(transaction);

        return {
            assetId,
        };
    }

    /**
     * Reads an asset record from IndexedDB.
     * @param {string} assetId - Asset identifier.
     * @returns {Promise<object|null>} - Stored asset record.
     */
    async function getAsset(assetId) {
        if (!assetId) {
            return null;
        }

        const database = await getDatabase();
        const transaction = database.transaction(ASSET_STORE_NAME, 'readonly');
        const request = transaction.objectStore(ASSET_STORE_NAME).get(assetId);
        const assetRecord = await waitForRequest(request);

        await waitForTransaction(transaction);
        return assetRecord || null;
    }

    /**
     * Resolves an object URL for a stored asset.
     * @param {string} assetId - Asset identifier.
     * @returns {Promise<string>} - Object URL or empty string.
     */
    async function getAssetUrl(assetId) {
        if (!assetId) {
            return '';
        }

        const cachedUrl = assetUrlCache.get(assetId);

        if (cachedUrl) {
            return cachedUrl;
        }

        const assetRecord = await getAsset(assetId);

        if (!assetRecord?.blob) {
            return '';
        }

        const objectUrl = URL.createObjectURL(assetRecord.blob);

        assetUrlCache.set(assetId, objectUrl);

        return objectUrl;
    }

    /**
     * Registers a state change listener.
     * @param {Function} listener - Listener callback.
     * @returns {Function} - Unsubscribe callback.
     */
    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    /**
     * Creates an async store scoped to a cache key.
     * @param {string} key - Scope key.
     * @returns {object} - Async scoped store.
     */
    function scope(key) {
        if (!key) {
            throw new Error('StorageService.scope requires a key');
        }

        return {
            async get() {
                await init();
                return state[key] ?? null;
            },

            async set(value) {
                await init();

                const removedAssetIds = Array.from(collectAssetIds(state[key]))
                    .filter((assetId) => !collectAssetIds(value).has(assetId));

                state[key] = value;
                await persistValue(key, value);
                await cleanupUnreferencedAssets(removedAssetIds);
                emit(key);
            },

            async update(fn) {
                await init();

                const prev = state[key] ?? null;
                const next = await fn(prev);
                const removedAssetIds = Array.from(collectAssetIds(prev))
                    .filter((assetId) => !collectAssetIds(next).has(assetId));

                state[key] = next;
                await persistValue(key, next);
                await cleanupUnreferencedAssets(removedAssetIds);
                emit(key);
            },

            async remove() {
                await init();

                const removedAssetIds = collectAssetIds(state[key]);

                delete state[key];
                await removeValue(key);
                await cleanupUnreferencedAssets(removedAssetIds);
                emit(key);
            },
        };
    }

    /**
     * Returns the current in-memory snapshot.
     * @returns {Promise<object>} - Current state snapshot.
     */
    async function getState() {
        await init();
        return state;
    }

    /**
     * Replaces the full in-memory and persisted state.
     * @param {object} nextState - Next full state.
     * @returns {Promise<void>} - Completion promise.
     */
    async function replaceState(nextState) {
        await init();

        const previousAssetIds = collectAssetIds(state);

        state = nextState || {};
        await replacePersistedState(state);

        const nextAssetIds = collectAssetIds(state);
        const removedAssetIds = Array.from(previousAssetIds)
            .filter((assetId) => !nextAssetIds.has(assetId));

        await cleanupUnreferencedAssets(removedAssetIds);
        emit('*');
    }

    /**
     * Clears all persisted state and assets.
     * @returns {Promise<void>} - Completion promise.
     */
    async function clear() {
        await init();

        state = {};
        const database = await getDatabase();
        const transaction = database.transaction(
            [DATA_STORE_NAME, ASSET_STORE_NAME],
            'readwrite',
        );

        transaction.objectStore(DATA_STORE_NAME).clear();
        transaction.objectStore(ASSET_STORE_NAME).clear();
        await waitForTransaction(transaction);

        assetUrlCache.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
        assetUrlCache.clear();
        emit('*');
    }

    return {
        init,
        scope,
        getState,
        replaceState,
        clear,
        subscribe,
        saveAsset,
        getAsset,
        getAssetUrl,
        removeAsset: deleteAssetRecord,
    };
})();

export function createStore(key, defaults) {
    const store = StorageService.scope(key);

    return {
        async get() {
            return (await store.get()) ?? defaults;
        },
        set: store.set,
        update: store.update,
    };
}

export default StorageService;