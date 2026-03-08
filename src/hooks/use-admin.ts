import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  User,
  Property,
} from "@/types";

// ─── Dashboard stats ───
export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
      return data.data;
    },
  });
}

// ─── All users ───
export function useAllUsers(filters: {
  page?: number;
  limit?: number;
  role?: string;
}) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>(
        "/admin/users",
        { params: filters }
      );
      return data.data;
    },
  });
}

// ─── All properties (admin) ───
export function useAdminProperties(filters: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["admin", "properties", filters],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<PaginatedResponse<Property>>
      >("/admin/properties", { params: filters });
      return data.data;
    },
  });
}

// ─── Review property (approve/reject) ───
export function useReviewProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "reject";
    }) => {
      const { data } = await api.put<ApiResponse<Property>>(
        `/admin/properties/${id}/review`,
        { action }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
