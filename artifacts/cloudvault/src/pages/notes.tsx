import { useState } from "react";
import { useListNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { getListNotesQueryKey } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StickyNote, Plus, Trash2, Edit2, Search } from "lucide-react";
import { toast } from "sonner";

export function Notes() {
  const [search, setSearch] = useState("");
  const { data: notes, isLoading } = useListNotes({ search: search || undefined });
  
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleOpenEditor = (note: any = null) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
    } else {
      setEditingNote(null);
      setTitle("");
      setContent("");
    }
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingNote) {
      updateNote.mutate({ 
        id: editingNote.id, 
        data: { title: title || "Untitled", content } 
      }, {
        onSuccess: () => {
          toast.success("Note updated");
          setIsEditorOpen(false);
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        }
      });
    } else {
      createNote.mutate({ 
        data: { title: title || "Untitled", content } 
      }, {
        onSuccess: () => {
          toast.success("Note created");
          setIsEditorOpen(false);
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this note?")) {
      deleteNote.mutate({ id }, {
        onSuccess: () => {
          toast.success("Note deleted");
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100dvh-64px)] md:h-screen overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Quick thoughts and secure text clips.</p>
        </div>
        <Button onClick={() => handleOpenEditor()} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search notes..." 
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !notes?.length ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <StickyNote className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No notes found</p>
          <p className="text-sm mb-6">Jot down something important</p>
          <Button variant="outline" onClick={() => handleOpenEditor()}>Write Note</Button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-12">
          {notes.map(note => (
            <Card key={note.id} className="break-inside-avoid relative group hover:shadow-md transition-shadow bg-[#fffdf0] dark:bg-card">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2">{note.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/50 hover:bg-background" onClick={() => handleOpenEditor(note)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive bg-background/50 hover:bg-background" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed line-clamp-6 mb-4">
                  {note.content}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatDate(note.updatedAt || note.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-0 px-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b"
            />
            <Textarea 
              placeholder="Start writing..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-none border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={createNote.isPending || updateNote.isPending}>
              {editingNote ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
