
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Team, Championship } from "@/types";

export interface MatchFormData {
  id?: string;
  homeTeamId: string;
  awayTeamId: string;
  championshipId: string;
  date: Date;
  predictionCost: number;
  prize: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

interface MatchFormProps {
  formData: MatchFormData;
  isEditing: boolean;
  isSaving: boolean;
  allTeams: Team[];
  championships: Championship[];
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
}

const MatchForm = ({
  formData,
  isEditing,
  isSaving,
  allTeams,
  championships,
  onSubmit,
  onInputChange,
  onNumberInputChange,
  onSelectChange,
  onDateChange,
}: MatchFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="homeTeamId">Time da Casa</Label>
          <Select 
            value={formData.homeTeamId} 
            onValueChange={(value) => onSelectChange("homeTeamId", value)}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o time da casa" />
            </SelectTrigger>
            <SelectContent>
              {allTeams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="awayTeamId">Time Visitante</Label>
          <Select 
            value={formData.awayTeamId} 
            onValueChange={(value) => onSelectChange("awayTeamId", value)}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o time visitante" />
            </SelectTrigger>
            <SelectContent>
              {allTeams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="championshipId">Campeonato</Label>
        <Select 
          value={formData.championshipId} 
          onValueChange={(value) => onSelectChange("championshipId", value)}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o campeonato" />
          </SelectTrigger>
          <SelectContent>
            {championships.map(championship => (
              <SelectItem key={championship.id} value={championship.id}>
                {championship.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full items-center gap-2">
        <Label>Data da Partida</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
              disabled={isSaving}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? (
                format(formData.date, "PPP")
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={onDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="status">Status da Partida</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onSelectChange("status", value as 'scheduled' | 'live' | 'finished')}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Agendada</SelectItem>
            <SelectItem value="live">Ao vivo</SelectItem>
            <SelectItem value="finished">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.status !== 'scheduled' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="homeScore">Gols do Time da Casa</Label>
            <Input 
              id="homeScore"
              name="homeScore"
              type="number"
              min="0"
              value={formData.homeScore || 0}
              onChange={onNumberInputChange}
              disabled={isSaving}
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="awayScore">Gols do Time Visitante</Label>
            <Input 
              id="awayScore"
              name="awayScore"
              type="number"
              min="0"
              value={formData.awayScore || 0}
              onChange={onNumberInputChange}
              disabled={isSaving}
            />
          </div>
        </div>
      )}

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="predictionCost">Custo do Palpite (créditos)</Label>
        <Input 
          id="predictionCost"
          name="predictionCost"
          type="number"
          min="1"
          value={formData.predictionCost}
          onChange={onNumberInputChange}
          disabled={isSaving}
          required
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="prize">Prêmio</Label>
        <Input 
          id="prize"
          name="prize"
          value={formData.prize}
          onChange={onInputChange}
          placeholder="Descrição do prêmio"
          disabled={isSaving}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Atualizar" : "Adicionar"} Partida
      </Button>
    </form>
  );
};

export default MatchForm;
