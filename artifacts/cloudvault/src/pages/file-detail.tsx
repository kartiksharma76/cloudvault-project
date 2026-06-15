import { useRoute } from "wouter";
import { useGetFile } from "@workspace/api-client-react";
import { formatBytes, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, FileIcon, Image as ImageIcon, Video, FileText } from "lucide-react";
import { Link } from "wouter";

export function FileDetail() {
  const [, params] = useRoute("/files/:id");
  const fileId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: file, isLoading } = useGetFile(fileId, { query: { enabled: !!fileId } as any });

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="p-8 text-center text-muted-foreground mt-20">
        <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-medium text-foreground">File not found</h2>
        <p className="mb-6">This file might have been deleted or you don't have access.</p>
        <Link href="/files">
          <Button variant="outline">Back to Files</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/files">
          <Button variant="ghost" className="gap-2 text-muted-foreground pl-0 hover:bg-transparent hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Files
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-0 shadow-md bg-muted/20">
            <div className="aspect-video w-full flex items-center justify-center bg-card">
              {file.fileType === "image" ? (
                <img 
                  src={`/api/storage${file.objectPath}`} 
                  alt={file.name} 
                  className="w-full h-full object-contain max-h-[600px]"
                />
              ) : file.fileType === "video" ? (
                <video 
                  src={`/api/storage${file.objectPath}`} 
                  controls 
                  className="w-full h-full object-contain max-h-[600px]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  {getFileIcon(file.fileType)}
                  <p className="mt-4 font-medium">Preview not available for this file type.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold break-words leading-tight">{file.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 capitalize">{file.fileType} Document</p>
              </div>

              <div className="space-y-4 py-4 border-y">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Size</span>
                  <span className="text-sm font-medium">{formatBytes(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uploaded</span>
                  <span className="text-sm font-medium">{formatDate(file.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Starred</span>
                  <span className="text-sm font-medium">{file.isStarred ? "Yes" : "No"}</span>
                </div>
              </div>

              <Button className="w-full gap-2" asChild>
                <a href={`/api/storage${file.objectPath}`} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getFileIcon(type: string) {
  switch(type) {
    case 'image': return <ImageIcon className="w-24 h-24 text-blue-500" />;
    case 'video': return <Video className="w-24 h-24 text-purple-500" />;
    case 'pdf': return <FileText className="w-24 h-24 text-red-500" />;
    case 'document': return <FileText className="w-24 h-24 text-green-500" />;
    default: return <FileIcon className="w-24 h-24 text-gray-500" />;
  }
}
