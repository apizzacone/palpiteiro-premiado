
import { Championship, Match, Team, User } from "@/types";

// Mock Teams
export const teams: Team[] = [
  {
    id: "1",
    name: "Flamengo",
    logo: "/placeholder.svg",
    country: "Brasil"
  },
  {
    id: "2",
    name: "Palmeiras",
    logo: "/placeholder.svg",
    country: "Brasil"
  },
  {
    id: "3",
    name: "Santos",
    logo: "/placeholder.svg",
    country: "Brasil"
  },
  {
    id: "4",
    name: "Corinthians",
    logo: "/placeholder.svg",
    country: "Brasil"
  },
  {
    id: "5",
    name: "São Paulo",
    logo: "/placeholder.svg",
    country: "Brasil"
  },
  {
    id: "6",
    name: "Grêmio",
    logo: "/placeholder.svg",
    country: "Brasil"
  }
];

// Mock Championships
export const championships: Championship[] = [
  {
    id: "1",
    name: "Brasileirão Série A",
    logo: "/placeholder.svg",
    country: "Brasil",
    teams: teams
  },
  {
    id: "2",
    name: "Copa do Brasil",
    logo: "/placeholder.svg",
    country: "Brasil",
    teams: teams
  }
];

// Mock Matches
export const matches: Match[] = [
  {
    id: "1",
    homeTeam: teams[0],
    awayTeam: teams[1],
    championship: championships[0],
    date: new Date(Date.now() + 86400000), // Tomorrow
    status: "scheduled",
    predictionCost: 10,
    prize: "Camisa oficial do time vencedor"
  },
  {
    id: "2",
    homeTeam: teams[2],
    awayTeam: teams[3],
    championship: championships[0],
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    status: "scheduled",
    predictionCost: 5,
    prize: "Par de ingressos para o próximo jogo"
  },
  {
    id: "3",
    homeTeam: teams[4],
    awayTeam: teams[5],
    championship: championships[1],
    date: new Date(Date.now() + 86400000), // Tomorrow
    status: "scheduled",
    predictionCost: 15,
    prize: "Bola autografada pelo time vencedor"
  }
];

// Mock User
export const currentUser: User = {
  id: "1",
  name: "Usuário Teste",
  email: "usuario@teste.com",
  credits: 100,
  predictions: []
};
