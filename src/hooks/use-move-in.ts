import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse, MoveIn } from "@/types";

// ─── Tenant: create move-in ───
export function useCreateMoveIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data } = await api.post<ApiResponse<MoveIn>>("/move-in", {
        propertyId,
      });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["move-ins"] }),
  });
}

// ─── Tenant: my move-ins ───
export function useMyMoveIns(filters: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["move-ins", "my", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<MoveIn>>>(
        "/move-in/my",
        { params: filters }
      );
      return data.data;
    },
  });
}

// ─── Get move-in by ID ───
export function useMoveInById(id: string) {
  return useQuery({
    queryKey: ["move-in", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MoveIn>>(`/move-in/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Owner/Admin: move-ins by property ───
export function useMoveInByProperty(
  propertyId: string,
  filters: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ["move-ins", "property", propertyId, filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<MoveIn>>>(
        `/move-in/property/${propertyId}`,
        { params: filters }
      );
      return data.data;
    },
    enabled: !!propertyId,
  });
}

// ─── Tenant: upload documents ───
export function useUploadDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, files }: { id: string; files: FileList }) => {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("documents", f));
      const { data } = await api.put<ApiResponse<MoveIn>>(
        `/move-in/${id}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["move-in"] }),
  });
}

// ─── Tenant: accept agreement ───
export function useAcceptAgreement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<MoveIn>>(
        `/move-in/${id}/agreement`
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["move-in"] }),
  });
}

// ─── Tenant: update inventory ───
export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      inventoryList,
    }: {
      id: string;
      inventoryList: string[];
    }) => {
      const { data } = await api.put<ApiResponse<MoveIn>>(
        `/move-in/${id}/inventory`,
        { inventoryList }
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["move-in"] }),
  });
}
