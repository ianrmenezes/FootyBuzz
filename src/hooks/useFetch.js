import { useState, useEffect, useCallback, useRef } from "react";
import { _consumePeek } from "../api/footballApi";

export default function useFetch(fetchFn, deps = [], options = {}) {
  const { autoRefresh = 0, enabled = true } = options;

  // ── Synchronous cache peek → render cached data on the very first frame ──
  const [data, setData] = useState(() => {
    if (!enabled) return null;
    try {
      fetchFn({ _peek: true });
      return _consumePeek() ?? null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => data == null && enabled);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const intervalRef = useRef(null);
  const spinnerTimer = useRef(null);
  const dataRef = useRef(data);

  const execute = useCallback(
    async (isBackground = false) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const hasStaleData = dataRef.current != null;

      // Only show spinner if we have NO data at all (cold miss)
      if (!isBackground && !hasStaleData) {
        setError(null);
        clearTimeout(spinnerTimer.current);
        spinnerTimer.current = setTimeout(() => {
          if (!controller.signal.aborted) {
            setLoading(true);
          }
        }, 150);
      }

      try {
        const result = await fetchFn({ signal: controller.signal });
        clearTimeout(spinnerTimer.current);
        if (!controller.signal.aborted) {
          setData(result);
          dataRef.current = result;
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(spinnerTimer.current);
        if (err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          if (!hasStaleData) {
            setData(null);
            dataRef.current = null;
            setError(err.message);
          }
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Peek cache for the (possibly new) endpoint on dep changes
    let peeked = null;
    try {
      fetchFn({ _peek: true });
      peeked = _consumePeek() ?? null;
    } catch {}

    if (peeked != null) {
      setData(peeked);
      dataRef.current = peeked;
      setLoading(false);
      execute(true); // background revalidation only
    } else {
      dataRef.current = null;
      execute(false); // full load with spinner
    }

    if (autoRefresh > 0) {
      intervalRef.current = setInterval(() => execute(true), autoRefresh);
    }

    return () => {
      clearTimeout(spinnerTimer.current);
      if (abortRef.current) abortRef.current.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [execute, autoRefresh, enabled]);

  return { data, loading, error, refetch: () => execute(false) };
}
