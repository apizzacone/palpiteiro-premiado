
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { championships } from "@/lib/mock-data";
import AdminLayout from "@/components/admin/AdminLayout";
import MatchForm from "@/components/admin/matches/MatchForm";
import MatchesList from "@/components/admin/matches/MatchesList";
import { useAdminMatches } from "@/hooks/use-admin-matches";

const AdminMatches = () => {
  const {
    allMatches,
    formData,
    isEditing,
    openDialog,
    setOpenDialog,
    isLoading,
    isSaving,
    allTeams,
    handleInputChange,
    handleNumberInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm
  } = useAdminMatches();

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciar Partidas</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Partida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Partida</DialogTitle>
            </DialogHeader>
            <MatchForm
              formData={formData}
              isEditing={isEditing}
              isSaving={isSaving}
              allTeams={allTeams}
              championships={championships}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              onNumberInputChange={handleNumberInputChange}
              onSelectChange={handleSelectChange}
              onDateChange={handleDateChange}
            />
          </DialogContent>
        </Dialog>
      </div>

      <MatchesList 
        isLoading={isLoading} 
        matches={allMatches} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </AdminLayout>
  );
};

export default AdminMatches;
