
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, FileJson, Clock, RotateCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// Interface for the backup item
interface BackupItem {
  id: string;
  created_at: string;
  description: string;
  size: number;
  tables: string[];
}

const AdminBackup = () => {
  const { toast } = useToast();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [backupDescription, setBackupDescription] = useState("");
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  
  // Function to create a backup
  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      
      // In a real implementation, this would call a Supabase Edge Function
      // that handles the database backup process
      const { data, error } = await supabase.functions.invoke("create-backup", {
        body: { description: backupDescription || `Backup ${new Date().toISOString()}` }
      });
      
      if (error) throw error;
      
      toast({
        title: "Backup created successfully",
        description: `Created backup: ${data?.id}`,
      });
      
      // Refresh backups list
      fetchBackups();
      setBackupDescription("");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast({
        title: "Failed to create backup",
        description: "There was an error creating the backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };
  
  // Function to restore from a backup
  const restoreBackup = async (backupId: string) => {
    if (!confirm("Are you sure you want to restore this backup? This will overwrite current data.")) {
      return;
    }
    
    try {
      setIsRestoringBackup(true);
      
      // In a real implementation, this would call a Supabase Edge Function
      // that handles the database restore process
      const { data, error } = await supabase.functions.invoke("restore-backup", {
        body: { backupId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Backup restored successfully",
        description: "The system has been restored from the selected backup.",
      });
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast({
        title: "Failed to restore backup",
        description: "There was an error restoring the backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };
  
  // Function to fetch available backups
  const fetchBackups = async () => {
    try {
      // In a real implementation, this would call a Supabase Edge Function
      // that retrieves the list of available backups
      const { data, error } = await supabase.functions.invoke("list-backups");
      
      if (error) throw error;
      
      setBackups(data || []);
    } catch (error) {
      console.error("Error fetching backups:", error);
      toast({
        title: "Failed to fetch backups",
        description: "There was an error fetching the backup list. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Load backups when component mounts
  useState(() => {
    fetchBackups();
  });
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };
  
  // Render manual backup UI
  const renderManualBackup = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="backup-description" className="text-sm font-medium">
          Backup Description (optional)
        </label>
        <input 
          id="backup-description"
          type="text" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter a description for this backup"
          value={backupDescription}
          onChange={(e) => setBackupDescription(e.target.value)}
        />
      </div>
      
      <Button 
        onClick={createBackup} 
        disabled={isCreatingBackup}
        className="w-full"
      >
        {isCreatingBackup ? (
          <>
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            Creating Backup...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Create Backup Now
          </>
        )}
      </Button>
    </div>
  );
  
  // Render list of backups
  const renderBackupsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Available Backups</h3>
        <Button variant="outline" size="sm" onClick={fetchBackups}>
          <RotateCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {backups.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <FileJson className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2">No backups available. Create your first backup to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <Card 
              key={backup.id} 
              className={`cursor-pointer transition-all ${selectedBackup === backup.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedBackup(backup.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{backup.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(backup.created_at), "PPpp")}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Size: {formatFileSize(backup.size)} • {backup.tables.length} tables
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreBackup(backup.id);
                    }}
                    disabled={isRestoringBackup}
                  >
                    {isRestoringBackup && selectedBackup === backup.id ? (
                      <RotateCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="ml-2">Restore</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>System Backup & Restore</CardTitle>
          <CardDescription>
            Create backups of your data and restore your system if needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Backup</TabsTrigger>
              <TabsTrigger value="restore">Restore Backup</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-4 space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Create a backup of your database. You will be able to restore your system to this state later.
              </div>
              <Separator />
              {renderManualBackup()}
            </TabsContent>
            <TabsContent value="restore" className="mt-4 space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Restore your system from a previously created backup. This will overwrite your current data.
              </div>
              <Separator />
              {renderBackupsList()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminBackup;
