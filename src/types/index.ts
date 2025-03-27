
export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  predictions: Prediction[];
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  country: string;
}

export interface Championship {
  id: string;
  name: string;
  logo: string;
  country: string;
  teams: Team[];
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  championship: Championship;
  date: Date;
  status: 'scheduled' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  predictionCost: number;
  prize: string;
}

export interface Prediction {
  id: string;
  user: User;
  match: Match;
  homeScore: number;
  awayScore: number;
  timestamp: Date;
  status: 'pending' | 'won' | 'lost';
}
