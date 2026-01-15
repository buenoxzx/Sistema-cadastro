import { useState } from "react";
import { useUpload } from "@/hooks/use-upload";
import { useCreateDocument } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface DocumentUploaderProps {
  clientId: number;
}

export function DocumentUploader({ clientId }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const createDocument = useCreateDocument();
  
  const { uploadFile, isUploading, progress, error } = useUpload({
    onSuccess: async (response) => {
      // Use the original file name and size from the response metadata echo or store locally
      // For now, assume single file flow where we can just grab from the file input event context if needed,
      // but useUpload returns what we need
      
      await createDocument.mutateAsync({
        clientId,
        filename: response.metadata.name,
        size: response.metadata.size,
        contentType: response.metadata.contentType,
        storageKey: response.objectPath,
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
      // Reset input value to allow uploading same file again
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out p-8 text-center",
          isDragging 
            ? "border-primary bg-primary/5 scale-[0.99]" 
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-80"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragging ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">
              {isUploading ? "Uploading..." : "Click to upload or drag & drop"}
            </h3>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, JPG, PNG up to 10MB
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-x-8 bottom-6">
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/5 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p>{error.message}</p>
        </div>
      )}
    </div>
  );
}
