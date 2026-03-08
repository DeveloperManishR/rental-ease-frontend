import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  VisitRequest,
  VisitStatus,
} from "@/types";

// ─── Tenant: create visit request ───
export function useCreateVisitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      propertyId: string;
      preferredDate: string;
    }) => {
      const { data } = await api.post<ApiResponse<VisitRequest>>(
        "/visits",
        payload
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visits"] }),
  });
}

// ─── Tenant: my visit requests ───
export function useMyVisitRequests(filters: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["visits", "my", filters],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<PaginatedResponse<VisitRequest>>
      >("/visits/my", { params: filters });
      return data.data;
    },
  });
}

// ─── Owner: visit requests for my properties ───
export function useOwnerVisitRequests(filters: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["visits", "owner", filters],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<PaginatedResponse<VisitRequest>>
      >("/visits/owner", { params: filters });
      return data.data;
    },
  });
}

// ─── Owner: update visit status ───
export function useUpdateVisitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      ownerNote,
    }: {
      id: string;
      status: VisitStatus;
      ownerNote?: string;
    }) => {
      const { data } = await api.put<ApiResponse<VisitRequest>>(
        `/visits/${id}/status`,
        { status, ownerNote }
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visits"] }),
  });
}
