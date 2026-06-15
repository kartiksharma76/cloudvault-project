import { useState } from "react";
import { useListFolders, useCreateFolder, useDeleteFolder } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { getListFoldersQueryKey } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderIcon, Plus, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export function Folders() {
  const { data: folders, isLoading } = useListFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const [newFolderName, setNewFolderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    createFolder.mutate({ data: { name: newFolderName } }, {
      onSuccess: () => {
        toast.success("Folder created");
        setNewFolderName("");
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
      },
      onError: () => {
        toast.error("Failed to create folder");
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto h-[calc(100dvh-64px)] md:h-screen overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
          <p className="text-muted-foreground">Organize your files into directories.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="Folder Name" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || createFolder.isPending}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !folders?.length ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <FolderIcon className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No folders yet</p>
          <p className="text-sm mb-6">Create a folder to start organizing</p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create Folder</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
          {folders.map(folder => (
            <Card key={folder.id} className="group relative hover:border-primary/50 transition-colors">
              <Link href={`/files?folderId=${folder.id}`}>
                <div className="cursor-pointer">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                      <FolderIcon className="w-6 h-6 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate mb-1" title={folder.name}>{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {folder.fileCount || 0} items • {formatDate(folder.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </div>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Delete folder "${folder.name}"?`)) {
                    deleteFolder.mutate({ id: folder.id }, {
                      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() })
                    });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
