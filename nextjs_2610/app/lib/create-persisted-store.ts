"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist, type PersistOptions } from "zustand/middleware";

/** localStorage를 기본으로 사용하는 스토어. 저장값 복원은 useStoreHydration에서 실행합니다. */
export function createPersistedStore<T, Persisted = Partial<T>>(
  initializer: StateCreator<T, [], []>,
  options: Omit<PersistOptions<T, Persisted>, "skipHydration">,
) {
  return create<T>()(
    persist(initializer, {
      storage: createJSONStorage<Persisted>(() => localStorage),
      ...options,
      skipHydration: true,
    }),
  );
}

type HydratableStore = {
  persist: {
    hasHydrated: () => boolean;
    rehydrate: () => void | Promise<void>;
    onHydrate: (listener: () => void) => () => void;
    onFinishHydration: (listener: () => void) => () => void;
  };
};

/** 마운트 후 저장값을 복원하고, 복원 완료 여부를 구독합니다. */
export function useStoreHydration(store: HydratableStore): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const unsubscribeStart = store.persist.onHydrate(onChange);
      const unsubscribeFinish = store.persist.onFinishHydration(onChange);

      return () => {
        unsubscribeStart();
        unsubscribeFinish();
      };
    },
    [store],
  );

  const hydrated = useSyncExternalStore(
    subscribe,
    () => store.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!store.persist.hasHydrated()) {
      void store.persist.rehydrate();
    }
  }, [store]);

  return hydrated;
}
