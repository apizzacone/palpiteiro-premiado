
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BanknoteIcon, 
  CreditCardIcon, 
  UploadIcon, 
  ArrowRightIcon, 
  CheckIcon 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { useMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const creditPackages = [
  { id: 1, amount: 100, price: 10.00 },
  { id: 2, amount: 300, price: 25.00 },
  { id: 3, amount: 500, price: 40.00 },
  { id: 4, amount: 1000, price: 75.00 },
];

const BuyCredits = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useMobile();
  
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[0]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Pix código "fake" para simulação
  const pixCode = `00020126330014BR.GOV.BCB.PIX0111123456789012520400005303986540${selectedPackage.price.toFixed(2).replace('.', '')}5802BR5913Palpiteiro6008Sao Paulo62150511${selectedPackage.id}0000000063044682`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    toast({
      title: "Código PIX copiado!",
      description: "Cole o código no seu aplicativo de banco.",
    });
    
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!user || !receiptFile) return;
    
    setIsLoading(true);
    
    try {
      // Upload do comprovante para o Storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment_receipts')
        .upload(fileName, receiptFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter URL pública do arquivo
      const { data: urlData } = await supabase.storage
        .from('payment_receipts')
        .getPublicUrl(fileName);
      
      // Criar transação no banco de dados
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: selectedPackage.amount,
          price: selectedPackage.price,
          payment_method: 'pix',
          receipt_url: urlData.publicUrl,
          status: 'pending'
        });
      
      if (transactionError) {
        throw transactionError;
      }
      
      // Fechar modal e mostrar confirmação
      setIsReceiptOpen(false);
      setIsCompleted(true);
      
      toast({
        title: "Comprovante enviado com sucesso!",
        description: "Seu pagamento está em análise e os créditos serão adicionados em breve.",
      });
    } catch (error) {
      console.error("Erro ao enviar comprovante:", error);
      toast({
        title: "Erro ao enviar comprovante",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Componente de confirmação
  const ConfirmationComponent = () => (
    <>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <BanknoteIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <DialogTitle className="text-xl">Confirmar compra de créditos</DialogTitle>
        <DialogDescription className="mt-2">
          Você está comprando {selectedPackage.amount} créditos por R$ {selectedPackage.price.toFixed(2)}
        </DialogDescription>
      </div>

      <div className="bg-muted p-4 rounded-lg mb-6">
        <div className="text-sm font-medium mb-2">Código PIX:</div>
        <div className="relative">
          <div className="p-3 bg-background border rounded-md text-xs break-all font-mono">
            {pixCode}
          </div>
          <Button 
            size="sm" 
            onClick={handleCopyPix}
            className="absolute top-2 right-2"
            variant={pixCopied ? "default" : "outline"}
          >
            {pixCopied ? <CheckIcon className="h-4 w-4 mr-1" /> : null}
            {pixCopied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          1. Copie o código PIX acima
        </p>
        <p className="text-sm text-muted-foreground">
          2. Abra o aplicativo do seu banco e faça o pagamento
        </p>
        <p className="text-sm text-muted-foreground">
          3. Após realizar o pagamento, clique no botão abaixo para enviar o comprovante
        </p>
      </div>

      <DialogFooter className="mt-6">
        <Button 
          onClick={() => {
            setIsConfirmOpen(false);
            setIsReceiptOpen(true);
          }}
          className="w-full"
        >
          Já fiz o pagamento <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );
  
  // Componente de envio de comprovante
  const ReceiptComponent = () => (
    <>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UploadIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <DialogTitle className="text-xl">Enviar comprovante</DialogTitle>
        <DialogDescription className="mt-2">
          Envie o comprovante do seu pagamento PIX para análise
        </DialogDescription>
      </div>

      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="receipt">Comprovante de pagamento</Label>
          <Input
            id="receipt"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </div>
        
        <Alert>
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Para agilizar a aprovação, certifique-se que o comprovante está legível e
            contém todas as informações da transação.
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooter className="mt-6">
        <Button
          onClick={handleSubmitReceipt}
          disabled={!receiptFile || isLoading}
          className="w-full"
        >
          {isLoading ? "Enviando..." : "Enviar comprovante"}
        </Button>
      </DialogFooter>
    </>
  );
  
  // Componente após a conclusão
  const CompletedComponent = () => (
    <div className="py-8 px-4 text-center">
      <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckIcon className="h-10 w-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Solicitação enviada!</h2>
      <p className="mb-6 text-muted-foreground">
        Seu pagamento está em análise. Assim que for aprovado, os créditos serão adicionados à sua conta.
      </p>
      
      <Button onClick={() => navigate("/")} className="w-full">
        Voltar para a página inicial
      </Button>
    </div>
  );

  if (isCompleted) {
    return (
      <Layout>
        <div className="container max-w-md py-12">
          <Card>
            <CardContent className="p-0">
              <CompletedComponent />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Comprar Créditos</h1>
            <p className="text-muted-foreground mt-2">
              Adicione créditos à sua conta para fazer mais palpites
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle>Escolha um pacote</CardTitle>
                <CardDescription>
                  Selecione a quantidade de créditos que deseja comprar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {creditPackages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all
                        ${selectedPackage.id === pkg.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary/50"}
                      `}
                    >
                      <div className="font-bold text-lg">{pkg.amount} Créditos</div>
                      <div className="text-2xl font-bold mt-2">R$ {pkg.price.toFixed(2)}</div>
                      <div className="text-muted-foreground text-sm mt-1">
                        {(pkg.price / pkg.amount).toFixed(2)} por crédito
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Tabs defaultValue="pix" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="pix">
                      <BanknoteIcon className="h-4 w-4 mr-2" /> PIX
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pix" className="mt-4">
                    <Button 
                      onClick={() => setIsConfirmOpen(true)} 
                      className="w-full"
                    >
                      Pagar com PIX
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Saldo atual</span>
                  <span className="font-bold">{profile?.credits || 0} créditos</span>
                </div>
                <div className="flex justify-between">
                  <span>Créditos a adicionar</span>
                  <span className="font-bold text-primary">+{selectedPackage.amount}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span>Total a pagar</span>
                  <span className="font-bold">R$ {selectedPackage.price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de confirmação em dispositivos móveis ou desktop */}
        {isMobile ? (
          <Drawer open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Confirmar compra</DrawerTitle>
                <DrawerDescription>
                  Você está comprando {selectedPackage.amount} créditos
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <ConfirmationComponent />
              </div>
              <DrawerFooter className="pt-0">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Cancelar
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <ConfirmationComponent />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de envio de comprovante */}
        {isMobile ? (
          <Drawer open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Enviar comprovante</DrawerTitle>
                <DrawerDescription>
                  Faça upload do comprovante de pagamento
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <ReceiptComponent />
              </div>
              <DrawerFooter className="pt-0">
                <Button
                  variant="outline"
                  onClick={() => setIsReceiptOpen(false)}
                >
                  Cancelar
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <ReceiptComponent />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default BuyCredits;
