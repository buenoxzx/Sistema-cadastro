import { useState } from "react";
import { Link } from "wouter";
import { useClients, useDeleteClient } from "@/hooks/use-clients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateClientDialog } from "@/components/CreateClientDialog";
import { Search, MoreHorizontal, User, Calendar, ArrowRight, Loader2, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { data: clients, isLoading, isError } = useClients(search);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / Header Section */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
                Clients
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your client database and documents.
              </p>
            </div>
            <CreateClientDialog />
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search by name or CPF..."
              className="pl-10 h-12 rounded-xl border-border bg-background shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-card rounded-2xl border border-border/60 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-destructive">Failed to load clients. Please try again.</p>
          </div>
        ) : clients?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground">No clients found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              {search ? "Try adjusting your search terms." : "Get started by adding your first client to the system."}
            </p>
            {!search && (
              <div className="mt-6">
                <CreateClientDialog />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ClientCard({ client }: { client: any }) {
  const [showEdit, setShowEdit] = useState(false);
  const deleteClient = useDeleteClient();

  return (
    <>
      <div className="group bg-card hover:bg-white rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary flex items-center justify-center font-bold text-lg font-display">
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEdit(true)} className="rounded-lg cursor-pointer">
                <Edit className="w-4 h-4 mr-2" /> Edit Details
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive rounded-lg cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Client
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <strong>{client.name}</strong> and all their associated documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteClient.mutate(client.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1 mb-4">
          <Link href={`/clients/${client.id}`} className="block">
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors cursor-pointer">
              {client.name}
            </h3>
          </Link>
          <p className="text-sm font-medium text-muted-foreground bg-muted/50 inline-block px-2 py-0.5 rounded-md">
            CPF: {client.cpf}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{client.createdAt ? format(new Date(client.createdAt), "MMM d, yyyy") : "N/A"}</span>
          </div>
          
          <Link href={`/clients/${client.id}`}>
            <Button variant="ghost" size="sm" className="h-8 px-2 -mr-2 text-primary hover:text-primary hover:bg-primary/5">
              View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      <CreateClientDialog 
        clientToEdit={client} 
        open={showEdit} 
        onOpenChange={setShowEdit} 
      />
    </>
  );
}
