import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'SALESPERSON';
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    _hasHydrated: boolean;
    setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            _hasHydrated: false,
            setAuth: (user, accessToken) => set({ user, accessToken }),
            logout: () => set({ user: null, accessToken: null }),
            setHasHydrated: (val) => set({ _hasHydrated: val }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
