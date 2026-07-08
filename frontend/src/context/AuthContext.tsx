import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { loginApi, logoutApi, refreshApi, registerApi } from "../api/auth.api";
import type {
    LoginRequest,
    RegisterRequest,
    User,
} from "../types/auth.types";
import { disconnectSocket } from "../realtime/socket";
import { AuthContext } from "./auth.context";

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (data: LoginRequest) => {
        const response = await loginApi(data);

        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
    };

    const register = async (data: RegisterRequest) => {
        const response = await registerApi(data);

        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
    };

    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            disconnectSocket();
            setUser(null);
            setAccessToken(null);
        }
    };

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await refreshApi();

                setUser(response.data.user);
                setAccessToken(response.data.accessToken);
            } catch {
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        void restoreSession();
    }, []);

    const value = useMemo(
        () => ({
            user,
            accessToken,
            isAuthenticated: Boolean(user && accessToken),
            isLoading,
            login,
            register,
            logout,
        }),
        [user, accessToken, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};