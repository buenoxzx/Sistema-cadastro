import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertDocument } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDocuments(clientId: number) {
  return useQuery({
    queryKey: [api.documents.listByClient.path, clientId],
    queryFn: async () => {
      const url = buildUrl(api.documents.listByClient.path, { clientId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.listByClient.responses[200].parse(await res.json());
    },
    enabled: !!clientId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertDocument) => {
      const validated = api.documents.create.input.parse(data);
      const res = await fetch(api.documents.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to link document");
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the documents list for this specific client
      const url = buildUrl(api.documents.listByClient.path, { clientId: data.clientId });
      queryClient.invalidateQueries({ queryKey: [api.documents.listByClient.path, data.clientId] });
      // Also invalidate client details as it might include document count or preview
      queryClient.invalidateQueries({ queryKey: [api.clients.get.path, data.clientId] });
      toast({ title: "Success", description: "Document uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save document metadata", variant: "destructive" });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: number, clientId: number }) => {
      const url = buildUrl(api.documents.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      return { id, clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: [api.documents.listByClient.path, clientId] });
      queryClient.invalidateQueries({ queryKey: [api.clients.get.path, clientId] });
      toast({ title: "Success", description: "Document deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    },
  });
}
