import { writeLocalData } from "./helpers/writeDataToFile.ts";
import { readDataFromFile } from "./helpers/readDataFromFile.ts";
import {Standing, Outcome, Fixture, LeagueData } from "./types/datatypes.d.ts"

// Store standings for home teams and away teams
const storeHomeStanding: Map<string, Standing> = new Map();
const storeAwayStanding: Map<string, Standing> = new Map();

/**
 * Processes the fixtures and updates the standings for both home and away teams.
 * 
 * This function reads the match fixtures from a file, then iterates over each 
 * fixture to update the standings of the home and away teams based on the 
 * scores
 * After processing, the standings are written to local files.
 */
  async function processFixtures(): Promise<void> {
    const data = readDataFromFile() as LeagueData;
    const leagueEntries = Object.entries(data); 

    for (const [league, fixtures] of leagueEntries) {
      updateStandings(fixtures);
      await writeStandingsToFile(league);
    }
  }

// Update the standings for home and away teams
function updateStandings(fixtures: Fixture[]): void {
  fixtures.forEach(fixture => {
    updateTeamStanding(storeHomeStanding, fixture.HomeTeam, fixture.HomeTeamScore, fixture.AwayTeamScore);
    updateTeamStanding(storeAwayStanding, fixture.AwayTeam, fixture.AwayTeamScore, fixture.HomeTeamScore);
  });
}

// Write the standings to local files
async function writeStandingsToFile(league: string): Promise<void> {
  await writeLocalData(league, "homestanding", storeHomeStanding);
  await writeLocalData(league, "awaystanding", storeAwayStanding);
}

/**
 * Updates the standing for a specified team based on the match results.
 * 
 * This function checks if the team already exists in the standings map. If the 
 * team exists, it updates the existing standing with the new match results. 
 * If the team does not exist, it creates a new standing entry for the team.
 *
 * @param standings - A Map that stores the standings of teams, where the key is 
 *                   the team name and the value is the team's Standing object.
 * @param team - The name of the team to be updated.
 * @param teamScore - The score achieved by the team in the match.
 * @param opponentScore - The score achieved by the opponent team in the match.
 */
function updateTeamStanding(standings: Map<string, Standing>, team: string, teamScore: number, opponentScore: number): void {
  const doesTeamExists = standings.get(team);
  const outcome = determineOutcome(teamScore, opponentScore);
  if (doesTeamExists) {
    updateExistingStanding(doesTeamExists, teamScore, opponentScore, outcome);
  } else {
    standings.set(team, createNewStanding(teamScore, opponentScore, outcome));
  }
}

/**
 * Determines the outcome of a match based on the scores of the two teams.
 * 
 * This function compares the scores of two teams and returns the outcome as 
 * either 'win', 'loss', or 'draw'.
 *
 * @param score1 - The score of the first team.
 * @param score2 - The score of the second team.
 * @returns The outcome of the match as an Outcome type ('win', 'loss', or 'draw').
 */
function determineOutcome(score1: number, score2: number): Outcome {
  if (score1 > score2) return 'win';
  if (score1 < score2) return 'loss';
  return 'draw';
}

/**
 * Creates a new standing entry for a team based on the match results.
 *
 * @param teamScore - The score achieved by the team in the match.
 * @param opponentScore - The score achieved by the opponent team in the match.
 * @param outcome - The outcome of the match as an Outcome type ('win', 'loss', or 'draw').
 * @returns A new Standing object representing the team's performance in the match.
 */
function createNewStanding(teamScore: number, opponentScore: number, outcome: Outcome): Standing {
  return {
    GP: 1, // Games Played
    W: outcome === 'win' ? 1 : 0, // Wins
    D: outcome === 'draw' ? 1 : 0, // Draws
    L: outcome === 'loss' ? 1 : 0, // Losses
    GF: teamScore, // Goals For
    GA: opponentScore, // Goals Against
    GD: teamScore - opponentScore, // Goal Difference
    Pts: outcome === 'win' ? 3 : outcome === 'draw' ? 1 : 0, // Points
  };
}

/**
 * Updates an existing standing entry for a team based on the match results.
 * 
 * @param team - The existing Standing object for the team to be updated.
 * @param teamScore - The score achieved by the team in the match.
 * @param opponentScore - The score achieved by the opponent team in the match.
 * @param outcome - The outcome of the match as an Outcome type ('win', 'loss', or 'draw').
 */
function updateExistingStanding(team: Standing, teamScore: number, opponentScore: number, outcome: Outcome): void {
  team.GP += 1; // Increment Games Played
  team.GF += teamScore; // Increment Goals For
  team.GA += opponentScore; // Increment Goals Against
  team.GD += teamScore - opponentScore; // Update Goal Difference

  if (outcome === 'win') {
    team.W += 1; // Increment Wins
    team.Pts += 3; // Add 3 points for a win
  } else if (outcome === 'draw') {
    team.D += 1; // Increment Draws
    team.Pts += 1; // Add 1 point for a draw
  } else if (outcome === 'loss') {
    team.L += 1; // Increment Losses
  }
}

await processFixtures()