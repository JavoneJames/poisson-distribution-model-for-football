// Type representing the parsed JSON structure for data fetched from the web regarding match details.
export type ParsedJsonFromWeb = {
  MatchNumber: number; // The unique number identifying the match.
  RoundNumber: number; // The round in which the match is played.
  DateUtc: string; // The date and time of the match in UTC format.
  Location: string; // The location where the match is held.
  Group: null; // The group to which the match belongs (currently set to null).
  HomeTeam: string; // The name of the home team.
  AwayTeam: string; // The name of the away team.
  HomeTeamScore: number | null; // The score of the home team (nullable if not available).
  AwayTeamScore: number | null; // The score of the away team (nullable if not available).
}[];

export type AllLeagueStandings = LeagueData[];

// Define the type for the league object with Fixture as its signature
export type LeagueData = {
  [leagueKey: string]: ExtractedFixture[];
};

// Type representing a fixture that contains details about a specific match between two teams.
type ExtractedFixture = {
  HomeTeam: string;
  HomeTeamScore: number;
  AwayTeam: string;
  AwayTeamScore: number;
};

// Type representing the standings of a team in the league.
export type HomeAwayStanding = {
  GP: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  Pts: number;
};

export type HomeAwayAnalysis = {
  AHG: number; //Average Home Goals
  AHCG: number; //Average Home Conceded Goals
  AS: number; //Attack Strength
  DS: number; //Defensive Strength
};

// Type representing the possible outcomes of a match.
export type Outcome = "win" | "loss" | "draw";

export type LeagueStats = {
  totalGF: number;
  totalGA: number;
};

// Type for a team entry
export type TeamEntry = {
  [leagueKey: string]: HomeAwayStanding[];
};

// Type for the standings, which is an array of team entries
export type Standings = TeamEntry[];