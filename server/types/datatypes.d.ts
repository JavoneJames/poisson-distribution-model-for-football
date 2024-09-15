// Type representing a collection of leagues, where each league is associated with an array of promises 
// that resolve to HTTP responses.
export type Leagues = {
  league: Promise<Response>[]
}

// Type representing the parsed JSON structure for data fetched from the web regarding match details.
export type ParsedJsonFromWeb = {
  MatchNumber: number                // The unique number identifying the match.
  RoundNumber: number                // The round in which the match is played.
  DateUtc: string                    // The date and time of the match in UTC format.
  Location: string                   // The location where the match is held.
  Group: null                        // The group to which the match belongs (currently set to null).
  HomeTeam: string                   // The name of the home team.
  AwayTeam: string                   // The name of the away team.
  HomeTeamScore: number | null       // The score of the home team (nullable if not available).
  AwayTeamScore: number | null       // The score of the away team (nullable if not available).
}[];

// Type representing a fixture that contains details about a specific match between two teams.
type Fixture = {
  HomeTeam: string                   
  AwayTeam: string                   
  HomeTeamScore: number              
  AwayTeamScore: number             
}

// Define the type for the league object with Fixture as its signature
export type LeagueData = {
  [leagueKey: string]: Fixture[];
}

// Type representing the standings of a team in the league.
export type Standing = {
  GP: number  
  W: number   
  D: number   
  L: number   
  GF: number  
  GA: number  
  GD: number  
  Pts: number 
}

// Type representing the possible outcomes of a match.
export type Outcome = 'win' | 'loss' | 'draw'
