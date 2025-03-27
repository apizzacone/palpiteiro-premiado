
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckIcon, XIcon, EyeIcon } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type TransactionWithUser = Tables<"credit_transactions"> & {
  profiles: {
    full_name: string | null;
    username: string | null;
    email?: string;
  };
};

const AdminCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithUser | null>(null);
  const [viewReceiptOpen, setViewReceiptOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            username
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTransactions(data as TransactionWithUser[]);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (transaction: TransactionWithUser) => {
    if (!user) return;
    
    try {
      // 1. Atualizar o status da transação
      const { error: updateError } = await supabase
        .from("credit_transactions")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      if (updateError) throw updateError;

      // 2. Adicionar créditos ao perfil do usuário
      const { error: creditsError } = await supabase
        .from("profiles")
        .update({
          credits: supabase.rpc("increment", { x: transaction.amount }),
        })
        .eq("id", transaction.user_id);

      if (creditsError) throw creditsError;

      // 3. Atualizar a lista de transações
      fetchTransactions();

      toast({
        title: "Pagamento aprovado",
        description: `${transaction.amount} créditos foram adicionados à conta do usuário.`,
      });
    } catch (error) {
      console.error("Erro ao aprovar transação:", error);
      toast({
        title: "Erro ao aprovar pagamento",
        description: "Não foi possível processar a aprovação.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (transaction: TransactionWithUser) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("credit_transactions")
        .update({
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      if (error) throw error;

      fetchTransactions();

      toast({
        title: "Pagamento rejeitado",
        description: "A solicitação de créditos foi rejeitada.",
      });
    } catch (error) {
      console.error("Erro ao rejeitar transação:", error);
      toast({
        title: "Erro ao rejeitar pagamento",
        description: "Não foi possível processar a rejeição.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const statusNames = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    };

    const style = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100";
    const name = statusNames[status as keyof typeof statusNames] || status;

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>{name}</span>;
  };

  return (
    <AdminLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gerenciar Solicitações de Créditos</CardTitle>
          <CardDescription>
            Aprove ou rejeite as solicitações de compra de créditos dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando transações...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4">Nenhuma transação encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {transaction.profiles?.full_name || 
                         transaction.profiles?.username || 
                         transaction.user_id.substring(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.payment_method}
                      </TableCell>
                      <TableCell>
                        R$ {parseFloat(transaction.price.toString()).toFixed(2)}
                      </TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {transaction.receipt_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setViewReceiptOpen(true);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {transaction.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                                onClick={() => handleApprove(transaction)}
                              >
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                                onClick={() => handleReject(transaction)}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para visualizar o comprovante */}
      <Dialog open={viewReceiptOpen} onOpenChange={setViewReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento</DialogTitle>
            <DialogDescription>
              Comprovante enviado pelo usuário {selectedTransaction?.profiles?.full_name || selectedTransaction?.profiles?.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center items-center py-4">
            {selectedTransaction?.receipt_url && (
              <div className="w-full">
                <img 
                  src={selectedTransaction.receipt_url} 
                  alt="Comprovante" 
                  className="max-w-full h-auto border rounded"
                />
                <div className="mt-4">
                  <a 
                    href={selectedTransaction.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Abrir em nova aba
                  </a>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedTransaction?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                  onClick={() => {
                    handleApprove(selectedTransaction);
                    setViewReceiptOpen(false);
                  }}
                >
                  <CheckIcon className="h-4 w-4 mr-2" /> Aprovar
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                  onClick={() => {
                    handleReject(selectedTransaction);
                    setViewReceiptOpen(false);
                  }}
                >
                  <XIcon className="h-4 w-4 mr-2" /> Rejeitar
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setViewReceiptOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCredits;
