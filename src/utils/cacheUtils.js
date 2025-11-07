export const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cloneArray = (value) => (Array.isArray(value) ? [...value] : []);

export const fetchWithCache = async (
  cacheRef,
  key,
  fetcher,
  options = {}
) => {
  if (!cacheRef?.current) {
    throw new Error('Invalid cache reference provided to fetchWithCache');
  }

  const { forceRefresh = false, ttl = DEFAULT_CACHE_TTL } = options;
  const cache = cacheRef.current;
  const now = Date.now();

  if (forceRefresh) {
    cache.delete(key);
  }

  const cachedEntry = cache.get(key);

  if (cachedEntry) {
    if (cachedEntry.promise) {
      return cachedEntry.promise;
    }

    if (!cachedEntry.expiry || cachedEntry.expiry > now) {
      return cachedEntry.data;
    }

    cache.delete(key);
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      cache.set(key, {
        data: result,
        expiry: Date.now() + ttl
      });
      return result;
    } catch (error) {
      cache.delete(key);
      throw error;
    }
  })();

  cache.set(key, { promise });
  return promise;
};

