import { HomeAwayAnalysis, LeagueStats } from "./types/datatypes.d.ts";
import { readDataFromFile } from "./helpers/readDataFromFile.ts";

const FILE_PATH = Deno.env.get("READ_STANDINGS_2024")!;

const [homeStanding, awayStanding] = readDataFromFile(FILE_PATH);
const storeHomeAnalysis: Map<string, HomeAwayAnalysis> = new Map();
const storeAwayAnalysis: Map<string, HomeAwayAnalysis> = new Map();

const leagueHomeStatistics: LeagueStats = {
  totalGF: 0,
  totalGA: 0,
  countedTeams: 0,
};

const leagueAwayStatistics: LeagueStats = {
  totalGF: 0,
  totalGA: 0,
  countedTeams: 0,
};

function processAnalysis(): void {
  if (Array.isArray(homeStanding) && Array.isArray(awayStanding)) {
    const length: number = Math.max(homeStanding.length, awayStanding.length);

    for (let i = 0; i < length; i++) {
      const homeFixture = homeStanding[i];
      const awayFixture = awayStanding[i];
      collectLeagueStats(leagueHomeStatistics, homeFixture);
      collectLeagueStats(leagueAwayStatistics, awayFixture);
    }

    for (let i = 0; i < length; i++) {
      const homeFixture = homeStanding[i];
      const awayFixture = awayStanding[i];
      extractRelevantData(leagueHomeStatistics, storeHomeAnalysis, homeFixture);
      extractRelevantData(leagueAwayStatistics, storeAwayAnalysis, awayFixture);
    }
  }
}

function extractRelevantData(
  leagueStatistics: { totalGF: number; totalGA: number; countedTeams: number },
  standings: Map<string, HomeAwayAnalysis>,
  teamData: [string, { GP: number; GF: number; GA: number; GD: number }],
): void {
  const [teamName, stats] = teamData;
  createAnalysisTable(leagueStatistics, standings, teamName, stats);
}

function collectLeagueStats(
  leagueStatistics: { totalGF: number; totalGA: number; countedTeams: number },
  teamData: [string, { GF: number; GA: number }],
): void {
  const [, stats] = teamData;
  leagueStatistics.totalGF += stats.GF;
  leagueStatistics.totalGA += stats.GA;
  leagueStatistics.countedTeams += 1;
}

function createAnalysisTable(
  leagueStatistics: { totalGF: number; totalGA: number; countedTeams: number },
  standings: Map<string, HomeAwayAnalysis>,
  teamName: string,
  stats: { GP: number; GF: number; GA: number; GD: number },
): void {
  const AHG = stats.GF > 0 ? stats.GP / stats.GF : 0
  const AHCG = stats.GA > 0 ? stats.GP / stats.GA : 0
  const AS = leagueStatistics.totalGF > 0 && stats.GF > 0 ? leagueStatistics.totalGF / stats.GF : 0
  const DS = leagueStatistics.totalGA > 0 && stats.GA > 0 ? leagueStatistics.totalGA / stats.GA : 0
  standings.set(teamName, {
    AHG: AHG,
    AHCG: AHCG,
    AS: AS,
    DS: DS,
  });
}

processAnalysis();