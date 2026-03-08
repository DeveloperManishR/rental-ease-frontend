import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse, Property } from "@/types";

// ─── Tenant: browse published properties ───
export function usePublishedProperties(filters: {
  page?: number;
  limit?: number;
  city?: string;
  minRent?: number;
  maxRent?: number;
  availableFrom?: string;
}) {
  return useQuery({
    queryKey: ["properties", "published", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Property>>>(
        "/properties",
        { params: filters }
      );
      return data.data;
    },
  });
}

// ─── Get property by id ───
export function usePropertyById(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Property>>(
        `/properties/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Owner: my properties ───
export function useMyProperties(filters: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["properties", "my", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Property>>>(
        "/properties/my",
        { params: filters }
      );
      return data.data;
    },
  });
}

// ─── Owner: create property ───
export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<ApiResponse<Property>>(
        "/properties",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

// ─── Owner: update property ───
export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put<ApiResponse<Property>>(
        `/properties/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

// ─── Owner: delete property ───
export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

// ─── Owner: submit for review ───
export function useSubmitForReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<Property>>(
        `/properties/${id}/submit`
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}
