import { Link, useRoute } from "wouter";
import { useClient } from "@/hooks/use-clients";
import { useDocuments, useDeleteDocument } from "@/hooks/use-documents";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Download, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentUploader } from "@/components/DocumentUploader";
import { CreateClientDialog } from "@/components/CreateClientDialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

export default function ClientDetails() {
  const [, params] = useRoute("/clients/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: client, isLoading: isClientLoading, error: clientError } = useClient(id);
  const { data: documents, isLoading: isDocsLoading } = useDocuments(id);
  const deleteDocument = useDeleteDocument();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isClientLoading) {
    return <ClientDetailsSkeleton />;
  }

  if (clientError || !client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold font-display text-foreground mb-2">Client not found</h2>
        <p className="text-muted-foreground mb-6">The client you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted -ml-2">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                {client.name}
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  {client.cpf}
                </span>
              </h1>
            </div>
            <CreateClientDialog 
              clientToEdit={client} 
              open={editDialogOpen} 
              onOpenChange={setEditDialogOpen}
              trigger={
                <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              } 
            />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Contact Info Card */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/60 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-display">Client Information</h2>
                <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <p className="text-foreground mt-0.5">{client.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-foreground mt-0.5">{client.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-foreground mt-0.5">
                      {client.createdAt ? format(new Date(client.createdAt), "MMMM d, yyyy") : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-display">Documents</h2>
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  {documents?.length || 0}
                </span>
              </div>

              {/* Upload Area */}
              <DocumentUploader clientId={client.id} />

              {/* File List */}
              <div className="space-y-3 mt-6">
                {isDocsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                  ))
                ) : documents && documents.length > 0 ? (
                  documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="group flex items-center justify-between p-4 bg-card hover:bg-muted/30 border border-border/50 hover:border-border rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(0)} KB • {format(new Date(doc.uploadedAt!), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a 
                          href={`/objects/${doc.storageKey}`} 
                          target="_blank" 
                          rel="noreferrer"
                          download={doc.filename}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete document?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{doc.filename}</strong>. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteDocument.mutate({ id: doc.id, clientId: client.id })}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5">
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Stats (Optional decorative area) */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-primary to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-primary/20 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-1">Quick Actions</h3>
              <p className="text-white/80 text-sm mb-6">Manage client account status and files.</p>
              
              <div className="space-y-3">
                <Button onClick={() => window.print()} variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white">
                  <FileText className="w-4 h-4 mr-2" /> Print Report
                </Button>
                <div className="h-px bg-white/20 my-2" />
                <p className="text-xs text-white/60">System ID: {client.id}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ClientDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b bg-white" />
      <div className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div className="hidden md:block">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
