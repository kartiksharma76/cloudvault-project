import { useGetStarredFiles, useToggleFileStar, useDeleteFile } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { getGetStarredFilesQueryKey } from "@workspace/api-client-react";
import { formatBytes, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, StarOff, MoreVertical, Download, Trash2, FileIcon, Image as ImageIcon, Video, FileText } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export function Starred() {
  const { data: files, isLoading } = useGetStarredFiles();
  const toggleStar = useToggleFileStar();
  const deleteFile = useDeleteFile();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100dvh-64px)] md:h-screen overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Starred Files</h1>
        <p className="text-muted-foreground">Quick access to your most important items.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !files?.length ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <Star className="w-16 h-16 mb-4 opacity-20 fill-current" />
          <p className="text-lg font-medium">No starred files</p>
          <p className="text-sm">Star files from the All Files page to see them here.</p>
          <Link href="/files" className="mt-6">
            <Button variant="outline">Browse Files</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-12">
          {files.map(file => (
            <Card key={file.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
              <Link href={`/files/${file.id}`}>
                <div className="cursor-pointer">
                  <div className="h-32 bg-muted/30 flex items-center justify-center border-b p-4 relative">
                    {getFileIcon(file.fileType)}
                    <Star className="absolute top-2 left-2 w-4 h-4 fill-yellow-400 text-yellow-400" />
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
                    <DropdownMenuItem 
                      onClick={() => toggleStar.mutate({ id: file.id }, {
                        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetStarredFilesQueryKey() })
                      })}
                    >
                      <StarOff className="w-4 h-4 mr-2" />
                      Remove Star
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/api/storage${file.objectPath}`} download target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Delete this file?")) {
                          deleteFile.mutate({ id: file.id }, {
                            onSuccess: () => {
                              toast.success("File deleted");
                              queryClient.invalidateQueries({ queryKey: getGetStarredFilesQueryKey() });
                            }
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
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
