"use client";

import { createPersistedStore } from "@/lib/create-persisted-store";

// 저장할 사용자 정보의 형태입니다.
type User = {
  id: number;
  username: string;
};

// 저장할 값과, 그 값을 바꾸는 함수를 정합니다.
type AuthStore = {
  user: User | null;
  token: string | null;
  setLogin: (user: User, token: string) => void;
  clearLogin: () => void;
};

export const useAuthStore = createPersistedStore<AuthStore>(
  (set) => ({
    // 처음에는 저장된 로그인 정보가 없습니다.
    user: null,
    token: null,

    // 로그인 성공 응답을 받으면 호출할 함수입니다.
    setLogin: (user, token) => set({
      user: { id: user.id, username: user.username },
      token: token,
    }),

    // 보관한 로그인 정보를 비우는 함수입니다.
    clearLogin: () => set({ user: null, token: null }),
  }),
  {
    name: "auth-storage",
    partialize: (state) => ({ user: state.user, token: state.token }),
  },
);