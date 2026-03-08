import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, User } from "@/types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>("/auth/profile");
      return data.data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name?: string; phone?: string }) => {
      const { data } = await api.put<ApiResponse<User>>(
        "/auth/profile",
        payload
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await api.put<ApiResponse<null>>("/auth/reset-password", {
        password,
      });
      return data;
    },
  });
}
