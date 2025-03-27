
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

// Define proper types for the transactions and profile
interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  price: number;
  status: string;
  payment_method: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

interface Profile {
  full_name: string | null;
  username: string | null;
  email?: string;
}

interface TransactionWithUser extends Transaction {
  profiles: Profile;
}

const AdminCredits = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithUser | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          *,
          profiles:user_id(full_name, username, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Cast properly to the expected type
      const typedData = data as unknown as TransactionWithUser[];
      setTransactions(typedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      // Update transaction status
      const { error: updateError } = await supabase
        .from('credit_transactions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedTransaction.id);
      
      if (updateError) throw updateError;
      
      // Call Supabase Edge Function to increment user credits
      const { error: functionError } = await supabase.functions.invoke('increment_credits', {
        body: {
          userId: selectedTransaction.user_id,
          amount: selectedTransaction.amount
        }
      });
      
      if (functionError) throw functionError;
      
      // Refresh transactions list
      fetchTransactions();
      
      toast({
        title: "Aprovado",
        description: `Créditos adicionados à conta do usuário.`,
      });
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a transação.",
        variant: "destructive",
      });
    } finally {
      setIsApproveDialogOpen(false);
      setSelectedTransaction(null);
    }
  };
  
  const handleRejectTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      // Update transaction status
      const { error } = await supabase
        .from('credit_transactions')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedTransaction.id);
      
      if (error) throw error;
      
      // Refresh transactions list
      fetchTransactions();
      
      toast({
        title: "Rejeitado",
        description: "A transação foi rejeitada.",
      });
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a transação.",
        variant: "destructive",
      });
    } finally {
      setIsRejectDialogOpen(false);
      setSelectedTransaction(null);
    }
  };
  
  const openApproveDialog = (transaction: TransactionWithUser) => {
    setSelectedTransaction(transaction);
    setIsApproveDialogOpen(true);
  };
  
  const openRejectDialog = (transaction: TransactionWithUser) => {
    setSelectedTransaction(transaction);
    setIsRejectDialogOpen(true);
  };
  
  const openReceiptDialog = (transaction: TransactionWithUser) => {
    setSelectedTransaction(transaction);
    setIsReceiptDialogOpen(true);
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <AdminLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento de Créditos</h1>
        
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Transações Pendentes</CardTitle>
                <CardDescription>
                  Avalie e aprove ou rejeite as solicitações de compra de créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsTable 
                  transactions={transactions.filter(t => t.status === 'pending')}
                  loading={loading}
                  onApprove={openApproveDialog}
                  onReject={openRejectDialog}
                  onViewReceipt={openReceiptDialog}
                  renderStatusBadge={renderStatusBadge}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>
                  Histórico completo de todas as transações de créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsTable 
                  transactions={transactions}
                  loading={loading}
                  onApprove={openApproveDialog}
                  onReject={openRejectDialog}
                  onViewReceipt={openReceiptDialog}
                  renderStatusBadge={renderStatusBadge}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprovar Transação</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja aprovar esta transação? Os créditos serão adicionados à conta do usuário.
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Usuário</Label>
                    <div className="font-medium">{selectedTransaction.profiles.full_name || selectedTransaction.profiles.username}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Valor</Label>
                    <div className="font-medium">R$ {selectedTransaction.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Créditos</Label>
                    <div className="font-medium">{selectedTransaction.amount} créditos</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Data</Label>
                    <div className="font-medium">{format(new Date(selectedTransaction.created_at), 'dd/MM/yyyy HH:mm')}</div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleApproveTransaction} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Transação</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja rejeitar esta transação? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Usuário</Label>
                    <div className="font-medium">{selectedTransaction.profiles.full_name || selectedTransaction.profiles.username}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Valor</Label>
                    <div className="font-medium">R$ {selectedTransaction.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Créditos</Label>
                    <div className="font-medium">{selectedTransaction.amount} créditos</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Data</Label>
                    <div className="font-medium">{format(new Date(selectedTransaction.created_at), 'dd/MM/yyyy HH:mm')}</div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRejectTransaction}>
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Comprovante de Pagamento</DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && selectedTransaction.receipt_url && (
              <div className="py-4">
                <div className="max-h-[70vh] overflow-auto">
                  <img 
                    src={selectedTransaction.receipt_url} 
                    alt="Comprovante de pagamento" 
                    className="w-full object-contain"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
                Fechar
              </Button>
              {selectedTransaction && selectedTransaction.status === 'pending' && (
                <>
                  <Button variant="destructive" onClick={() => {
                    setIsReceiptDialogOpen(false);
                    openRejectDialog(selectedTransaction);
                  }}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    setIsReceiptDialogOpen(false);
                    openApproveDialog(selectedTransaction);
                  }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

// Helper component for the transactions table
const TransactionsTable = ({ 
  transactions, 
  loading, 
  onApprove, 
  onReject, 
  onViewReceipt,
  renderStatusBadge
}) => {
  if (loading) {
    return <div className="py-8 text-center">Carregando transações...</div>;
  }
  
  if (transactions.length === 0) {
    return <div className="py-8 text-center">Nenhuma transação encontrada.</div>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Créditos</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Método</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
            <TableCell>{transaction.profiles.full_name || transaction.profiles.username}</TableCell>
            <TableCell>{transaction.amount}</TableCell>
            <TableCell>R$ {transaction.price.toFixed(2)}</TableCell>
            <TableCell>{transaction.payment_method === 'pix' ? 'PIX' : transaction.payment_method}</TableCell>
            <TableCell>{renderStatusBadge(transaction.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {transaction.receipt_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewReceipt(transaction)}
                  >
                    Ver comprovante
                  </Button>
                )}
                
                {transaction.status === 'pending' && (
                  <>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onReject(transaction)}
                    >
                      Rejeitar
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onApprove(transaction)}
                    >
                      Aprovar
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminCredits;
