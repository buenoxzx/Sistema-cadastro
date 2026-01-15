import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type InsertClient } from "@shared/schema";
import { useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { z } from "zod";

// Extend schema to ensure empty strings are handled if needed, though zod usually handles this
const formSchema = insertClientSchema.extend({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

interface CreateClientDialogProps {
  clientToEdit?: InsertClient & { id: number };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateClientDialog({ clientToEdit, open: controlledOpen, onOpenChange, trigger }: CreateClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertClient>({
    resolver: zodResolver(formSchema),
    defaultValues: clientToEdit || {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: InsertClient) => {
    try {
      if (clientToEdit) {
        await updateMutation.mutateAsync({ id: clientToEdit.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl transition-all hover:-translate-y-0.5">
            <Plus className="w-5 h-5 mr-2" />
            New Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden bg-card">
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-primary">
              {clientToEdit ? "Edit Client" : "Add New Client"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              {clientToEdit 
                ? "Make changes to the client's information below." 
                : "Enter the details of the new client to add them to the system."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80 font-medium">Full Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g. Jane Doe"
              className="rounded-xl border-border bg-background focus:ring-primary/20"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive font-medium">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-foreground/80 font-medium">CPF</Label>
              <Input
                id="cpf"
                {...form.register("cpf")}
                placeholder="000.000.000-00"
                className="rounded-xl border-border bg-background focus:ring-primary/20"
              />
              {form.formState.errors.cpf && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.cpf.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground/80 font-medium">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="(00) 00000-0000"
                className="rounded-xl border-border bg-background focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="jane@example.com"
              className="rounded-xl border-border bg-background focus:ring-primary/20"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive font-medium">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground/80 font-medium">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional information..."
              className="min-h-[100px] rounded-xl border-border bg-background focus:ring-primary/20 resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-xl border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                clientToEdit ? "Save Changes" : "Create Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
