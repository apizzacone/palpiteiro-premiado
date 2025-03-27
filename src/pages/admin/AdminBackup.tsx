
import { useState, useEffect } from "react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, HardDrive, RotateCcw, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface Backup {
  id: string;
  description: string;
  created_at: string;
  size: number;
  tables: string[];
}

const AdminBackup = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [backupDescription, setBackupDescription] = useState("");

  const fetchBackups = async () => {
    try {
      setLoading(true);

      const { data: backupData, error } = await supabase.functions.invoke('list-backups');
      
      if (error) throw error;
      
      setBackups(backupData);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: { description: backupDescription.trim() || `Backup do sistema ${new Date().toLocaleDateString()}` }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Backup criado com sucesso!');
        setBackupDescription("");
        await fetchBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Erro ao criar backup');
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      setRestoring(true);
      setRestoringId(backupId);
      
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { backupId }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message || 'Sistema restaurado com sucesso!');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Erro ao restaurar o sistema');
    } finally {
      setRestoring(false);
      setRestoringId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Backup e Restauração do Sistema</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 w-64">
            <Input
              placeholder="Descrição do backup"
              value={backupDescription}
              onChange={(e) => setBackupDescription(e.target.value)}
              disabled={creating}
            />
          </div>
          <Button 
            onClick={handleCreateBackup} 
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Criar Backup
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <HardDrive className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Backup e Restauração</h3>
            <p className="text-sm text-muted-foreground">
              Crie backups do sistema e restaure-os quando necessário. Os backups incluem todos os dados do sistema.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Carregando backups...</span>
        </div>
      ) : backups.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Tabelas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.map((backup) => (
              <TableRow key={backup.id}>
                <TableCell className="font-medium">{backup.description}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{format(new Date(backup.created_at), "dd/MM/yyyy HH:mm")}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(backup.created_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatSize(backup.size)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {backup.tables.map((table) => (
                      <span 
                        key={table} 
                        className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs"
                      >
                        {table}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restaurar sistema</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja restaurar o sistema para o estado deste backup? 
                          Esta ação irá substituir todos os dados atuais.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={restoring}
                        >
                          {restoring && restoringId === backup.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Restaurando...
                            </>
                          ) : (
                            'Confirmar Restauração'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum backup encontrado</h3>
          <p className="text-muted-foreground">
            Nenhum backup foi criado ainda. Clique em "Criar Backup" para fazer seu primeiro backup.
          </p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBackup;
