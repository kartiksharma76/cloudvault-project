import { useState, useRef } from "react";
import { Link } from "wouter";
import { useListFiles, useCreateFile, useRequestUploadUrl, useToggleFileStar, useDeleteFile } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { getListFilesQueryKey } from "@workspace/api-client-react";
import { formatBytes, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  FileIcon, Search, UploadCloud, MoreVertical, Star, StarOff, 
  Trash2, Download, Image as ImageIcon, Video, FileText, LayoutGrid, List as ListIcon 
} from "lucide-react";

export function Files() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<any>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, isLoading } = useListFiles({ search: search || undefined, type: typeFilter === "all" ? undefined : typeFilter });
  const requestUrl = useRequestUploadUrl();
  const createFile = useCreateFile();
  const toggleStar = useToggleFileStar();
  const deleteFile = useDeleteFile();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Preparing upload...");
      const { uploadURL, objectPath } = await requestUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type }
      });

      toast.loading("Uploading file...");
      await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      // Simple file type categorization
      let fileType: "image" | "video" | "document" | "pdf" | "other" = "other";
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("video/")) fileType = "video";
      else if (file.type === "application/pdf") fileType = "pdf";
      else if (file.type.includes("document") || file.type.includes("text")) fileType = "document";

      await createFile.mutateAsync({
        data: {
          name: file.name,
          objectPath,
          size: file.size,
          mimeType: file.type,
          fileType,
          folderId: null
        }
      });

      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100dvh-64px)] md:h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Files</h1>
          <p className="text-muted-foreground">Manage and organize your documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload File
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? undefined : v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="pdf">PDFs</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center border rounded-md p-1 bg-muted/50">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-3"}>
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className={viewMode === "grid" ? "h-48 w-full rounded-xl" : "h-16 w-full rounded-xl"} />
            ))}
          </div>
        ) : !files?.length ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <FileIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm mb-6">Upload some files to get started</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload File
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-12">
            {files.map(file => (
              <FileCard 
                key={file.id} 
                file={file} 
                onStar={() => {
                  toggleStar.mutate({ id: file.id }, {
                    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() })
                  });
                }}
                onDelete={() => {
                  deleteFile.mutate({ id: file.id }, {
                    onSuccess: () => {
                      toast.success("File deleted");
                      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
                    }
                  });
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-12">
            {files.map(file => (
              <FileListItem 
                key={file.id} 
                file={file} 
                onStar={() => {
                  toggleStar.mutate({ id: file.id }, {
                    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() })
                  });
                }}
                onDelete={() => {
                  deleteFile.mutate({ id: file.id }, {
                    onSuccess: () => {
                      toast.success("File deleted");
                      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
                    }
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getFileIcon(type: string) {
  switch(type) {
    case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />;
    case 'video': return <Video className="w-8 h-8 text-purple-500" />;
    case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
    case 'document': return <FileText className="w-8 h-8 text-green-500" />;
    default: return <FileIcon className="w-8 h-8 text-gray-500" />;
  }
}

function getSmallFileIcon(type: string) {
  switch(type) {
    case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
    case 'video': return <Video className="w-5 h-5 text-purple-500" />;
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'document': return <FileText className="w-5 h-5 text-green-500" />;
    default: return <FileIcon className="w-5 h-5 text-gray-500" />;
  }
}

function FileCard({ file, onStar, onDelete }: any) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
      <Link href={`/files/${file.id}`}>
        <div className="cursor-pointer">
          <div className="h-32 bg-muted/30 flex items-center justify-center border-b p-4 relative">
            {getFileIcon(file.fileType)}
            {file.isStarred && (
              <Star className="absolute top-2 left-2 w-4 h-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium truncate text-sm mb-1" title={file.name}>{file.name}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatBytes(file.size)}</span>
              <span>{formatDate(file.createdAt)}</span>
            </div>
          </CardContent>
        </div>
      </Link>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onStar}>
              {file.isStarred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
              {file.isStarred ? "Remove Star" : "Add Star"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/api/storage${file.objectPath}`} download target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

function FileListItem({ file, onStar, onDelete }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border bg-card">
      <Link href={`/files/${file.id}`} className="flex items-center gap-4 flex-1 cursor-pointer min-w-0">
        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
          {getSmallFileIcon(file.fileType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{file.name}</p>
            {file.isStarred && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
            <span>{formatBytes(file.size)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </Link>
      
      <div className="flex items-center gap-2 pl-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onStar}>
              {file.isStarred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
              {file.isStarred ? "Remove Star" : "Add Star"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/api/storage${file.objectPath}`} download target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
