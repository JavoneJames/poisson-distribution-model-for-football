import {
  ExtractedFixture,
  HomeAwayAnalysis,
  HomeAwayStanding,
  LeagueData,
  Outcome,
  ParsedJsonFromWeb,
  Standings,
  TeamEntry,
  AllLeagueStandings
} from "../types/datatypes.d.ts";


// Type check function for ParsedJsonFromWeb
export function isParsedJsonFromWeb(data: any): data is ParsedJsonFromWeb {
  if (!Array.isArray(data)) return false;

  return data.every((item) => (
    typeof item === "object" &&
    item !== null &&
    typeof item.MatchNumber === "number" &&
    typeof item.RoundNumber === "number" &&
    typeof item.DateUtc === "string" &&
    typeof item.Location === "string" &&
    item.Group === null &&
    typeof item.HomeTeam === "string" &&
    typeof item.AwayTeam === "string" &&
    (typeof item.HomeTeamScore === "number" || item.HomeTeamScore === null) &&
    (typeof item.AwayTeamScore === "number" || item.AwayTeamScore === null)
  ));
}

// Type check function for AllLeagueStandings
export function isAllLeagueStandings(data: any): data is AllLeagueStandings {
  return Array.isArray(data) && data.every(isLeagueData);
}

// Type check function for LeagueData
export function isLeagueData(data: any): data is LeagueData {
  if (typeof data !== "object" || data === null) return false;

  return Object.values(data).every((fixtures: any) => Array.isArray(fixtures) && fixtures.every(isExtractedFixture));
}

// Type check function for Fixture
export function isExtractedFixture(data: any): data is ExtractedFixture {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.HomeTeam === "string" &&
    typeof data.HomeTeamScore === "number" &&
    typeof data.AwayTeam === "string" &&
    typeof data.AwayTeamScore === "number"
  );
}

// Type check function for HomeAwayAnalysis
export function isHomeAwayAnalysis(data: any): data is HomeAwayAnalysis {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.AHG === "number" &&
    typeof data.AHCG === "number" &&
    typeof data.AS === "number" &&
    typeof data.DS === "number"
  );
}

// Type check function for Outcome
export function isOutcome(data: any): data is Outcome {
  return ["win", "loss", "draw"].includes(data);
}

// Type check function for Standings
export function isStandings(data: any): data is Standings {
  return Array.isArray(data) && data.every(isTeamEntry);
}

export function isTeamEntry(obj: any): obj is TeamEntry {
  if (typeof obj !== "object" || obj === null) return false;

  // Check if every property is a valid TeamStats object
  return Object.values(obj).every(isHomeAwayStanding);
}

export function isHomeAwayStanding(obj: any): obj is HomeAwayStanding {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.GP === "number" &&
    typeof obj.W === "number" &&
    typeof obj.D === "number" &&
    typeof obj.L === "number" &&
    typeof obj.GF === "number" &&
    typeof obj.GA === "number" &&
    typeof obj.GD === "number" &&
    typeof obj.Pts === "number"
  );
}