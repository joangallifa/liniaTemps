import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_APP_STATUS, type AppKey, type AppStatus } from "../lib/appSettings";

export function useAppStatus(appKey: AppKey) {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    supabase
      .from("app_settings")
      .select("status")
      .eq("app_key", appKey)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setStatus((data?.status as AppStatus | undefined) ?? DEFAULT_APP_STATUS[appKey]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appKey]);

  return { status, loading };
}
