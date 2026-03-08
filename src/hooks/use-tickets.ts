import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse, Ticket } from "@/types";

// ─── Tenant: create ticket ───
export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; message: string }) => {
      const { data } = await api.post<ApiResponse<Ticket>>(
        "/tickets",
        payload
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

// ─── Tenant: my tickets ───
export function useMyTickets(filters: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["tickets", "my", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Ticket>>>(
        "/tickets/my",
        { params: filters }
      );
      return data.data;
    },
  });
}

// ─── Admin: all tickets ───
export function useAllTickets(filters: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["tickets", "all", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Ticket>>>(
        "/tickets",
        { params: filters }
      );
      return data.data;
    },
  });
}

// ─── Get ticket by ID ───
export function useTicketById(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Add message to ticket ───
export function useAddMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const { data } = await api.post<ApiResponse<Ticket>>(
        `/tickets/${id}/message`,
        { message }
      );
      return data.data;
    },
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["ticket", variables.id] }),
  });
}

// ─── Admin: close ticket ───
export function useCloseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<Ticket>>(
        `/tickets/${id}/close`
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}
