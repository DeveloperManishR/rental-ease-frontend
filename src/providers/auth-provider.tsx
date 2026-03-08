import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import api from "@/lib/axios";
import type {
    User,
    ApiResponse,
    AuthResponse,
    LoginPayload,
    RegisterPayload,
} from "@/types";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch profile on mount (relies on httpOnly cookies)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get<ApiResponse<User>>("/auth/profile");
                if (data.success) setUser(data.data);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const login = useCallback(async (payload: LoginPayload) => {
        const { data } = await api.post<ApiResponse<AuthResponse>>(
            "/public/login",
            payload
        );
        if (data.success) setUser(data.data.user);
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        const { data } = await api.post<ApiResponse<AuthResponse>>(
            "/public/register",
            payload
        );
        if (data.success) setUser(data.data.user);
    }, []);

    const logout = useCallback(async () => {
        await api.post("/public/logout");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
