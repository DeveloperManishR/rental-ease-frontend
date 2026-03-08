import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/routes/protected-route";

// Layouts
import TenantLayout from "@/components/layouts/tenant-layout";
import OwnerLayout from "@/components/layouts/owner-layout";
import AdminLayout from "@/components/layouts/admin-layout";

// Auth Pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";

// Shared Pages
import ProfilePage from "@/pages/shared/profile";

// Tenant Pages
import TenantProperties from "@/pages/tenant/properties";
import PropertyDetail from "@/pages/tenant/property-detail";
import TenantVisits from "@/pages/tenant/visits";
import TenantMoveIns from "@/pages/tenant/move-ins";
import MoveInDetail from "@/pages/tenant/move-in-detail";
import TenantTickets from "@/pages/tenant/tickets";
import CreateTicket from "@/pages/tenant/create-ticket";
import TicketDetail from "@/pages/tenant/ticket-detail";

// Owner Pages
import OwnerProperties from "@/pages/owner/properties";
import CreateProperty from "@/pages/owner/create-property";
import EditProperty from "@/pages/owner/edit-property";
import OwnerVisits from "@/pages/owner/visits";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminProperties from "@/pages/admin/properties";
import AdminPropertyDetail from "@/pages/admin/property-detail";
import AdminTickets from "@/pages/admin/tickets";
import AdminTicketDetail from "@/pages/admin/ticket-detail";

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const dashboardMap: Record<string, string> = {
    tenant: "/tenant/properties",
    owner: "/owner/properties",
    admin: "/admin/dashboard",
  };

  return <Navigate to={dashboardMap[user.role]} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      
      <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
        <Route path="/tenant" element={<TenantLayout />}>
          <Route index element={<Navigate to="properties" replace />} />
          <Route path="properties" element={<TenantProperties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="visits" element={<TenantVisits />} />
          <Route path="move-ins" element={<TenantMoveIns />} />
          <Route path="move-ins/:id" element={<MoveInDetail />} />
          <Route path="tickets" element={<TenantTickets />} />
          <Route path="tickets/new" element={<CreateTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      
      <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="properties" replace />} />
          <Route path="properties" element={<OwnerProperties />} />
          <Route path="properties/new" element={<CreateProperty />} />
          <Route path="properties/:id/edit" element={<EditProperty />} />
          <Route path="visits" element={<OwnerVisits />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/:id" element={<AdminPropertyDetail />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="tickets/:id" element={<AdminTicketDetail />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
