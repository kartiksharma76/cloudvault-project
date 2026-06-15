import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { formatBytes, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Folder, HardDrive, StickyNote, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: isActivityLoading } = useGetRecentActivity();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your personal cloud vault.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Storage Used" 
          value={isSummaryLoading ? <Skeleton className="h-8 w-24" /> : formatBytes(summary?.storageUsedBytes || 0)} 
          icon={HardDrive} 
          description="Out of 10 GB limit"
        />
        <StatsCard 
          title="Total Files" 
          value={isSummaryLoading ? <Skeleton className="h-8 w-16" /> : summary?.totalFiles} 
          icon={FileText} 
        />
        <StatsCard 
          title="Total Folders" 
          value={isSummaryLoading ? <Skeleton className="h-8 w-16" /> : summary?.totalFolders} 
          icon={Folder} 
        />
        <StatsCard 
          title="Total Notes" 
          value={isSummaryLoading ? <Skeleton className="h-8 w-16" /> : summary?.totalNotes} 
          icon={StickyNote} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        {item.type === 'file' ? <FileText className="w-5 h-5" /> : <StickyNote className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.type} {item.action}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No recent activity to show.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Storage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documents</span>
                    <span className="font-medium">{summary?.filesByType.document || 0} files</span>
                  </div>
                  <Progress value={((summary?.filesByType.document || 0) / (summary?.totalFiles || 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Images</span>
                    <span className="font-medium">{summary?.filesByType.image || 0} files</span>
                  </div>
                  <Progress value={((summary?.filesByType.image || 0) / (summary?.totalFiles || 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Videos</span>
                    <span className="font-medium">{summary?.filesByType.video || 0} files</span>
                  </div>
                  <Progress value={((summary?.filesByType.video || 0) / (summary?.totalFiles || 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>PDFs</span>
                    <span className="font-medium">{summary?.filesByType.pdf || 0} files</span>
                  </div>
                  <Progress value={((summary?.filesByType.pdf || 0) / (summary?.totalFiles || 1)) * 100} className="h-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
