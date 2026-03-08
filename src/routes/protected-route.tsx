import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types";

interface Props {
    allowedRoles: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: Props) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role)) {
        // Redirect users to their own dashboard
        const dashboardMap: Record<UserRole, string> = {
            tenant: "/tenant/properties",
            owner: "/owner/properties",
            admin: "/admin/dashboard",
        };
        return <Navigate to={dashboardMap[user.role]} replace />;
    }

    return <Outlet />;
}
