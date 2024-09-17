import { writeParsedData } from "./helpers/writeDataToFile.ts";
import { readDataFromFile } from "./helpers/readDataFromFile.ts";
import {
  Fixture,
  HomeAwayStanding,
  LeagueData,
  Outcome,
} from "./types/datatypes.d.ts";
import { loggingHandler } from "./helpers/loggingHandler.ts";

const FILE_PATH: string = Deno.env.get("READ_EPL_2024")!;
const DATA: (LeagueData | null)[] = readDataFromFile(FILE_PATH)!;

class GenerateHomeAwayStandings {
  // Store standings for home teams and away teams
  private storeHomeStanding: Map<string, HomeAwayStanding> = new Map();
  private storeAwayStanding: Map<string, HomeAwayStanding> = new Map();

  /**
   *
   * This function a particular league data from a file, then calls {@link processLeague} 
   * to iterate over each fixture to update the standings for home and away games based on the
   * scores per fixture
   * After processing, the standings are written to file.
   * 
   * @return void Promise
   */
  async processFixtures(): Promise<void> {
    let leagueName: string = ""
    for (const league of DATA) {
      if (league === null) {
        this.logNullLeagueData();
        continue; // Skip to the next league
      }
      leagueName = this.processLeague(league);
    }
    await this.writeStandings(leagueName);
  }

  /**
   * Logs an error if the league data is null.
   * 
   * @private
   * @return void
   */
  private logNullLeagueData(): void {
    loggingHandler(`League data is null: ${FILE_PATH}`);
  }

  /**
   * Gets a league's fixtures then calls {@link updateStandings} to updates the standings.
   * 
   * @private
   * @param league - The league data containing match fixtures.
   * @returns leagueName - The name of the league being processed.
   */
  private processLeague(league: LeagueData): string {
    let leagueName: string = ''; // Initialize leagueName
  
    for (const [key, fixtures] of Object.entries(league)) {
      leagueName = key; // Capture the league name
      this.updateStandings(fixtures);
    }
    return leagueName; 
  }
  

 /**
   * Writes the standings to file.
   * 
   * @private
   * @async
   * @param leagueName - The league name, used to generate file names.
   * @returns void Promise - Resolves after standings are written to file.
   */
  private async writeStandings(leagueName: string): Promise<void> {
      try {
        await this.writeStandingsToFile(leagueName);
      } catch (error) {
        loggingHandler(`Attempted to write to file using following data: ${leagueName} ${error}`)
      }
  }

  /**
   * Updates the standings for both home and away teams based on match results.
   * 
   * @private
   * @param fixtures - An array of fixture objects to process.
   */
  private updateStandings(fixtures: Fixture[]): void {
    fixtures.forEach((fixture) => {
      this.updateTeamStanding(
        this.storeHomeStanding,
        fixture.HomeTeam,
        fixture.HomeTeamScore,
        fixture.AwayTeamScore,
      );
      this.updateTeamStanding(
        this.storeAwayStanding,
        fixture.AwayTeam,
        fixture.AwayTeamScore,
        fixture.HomeTeamScore,
      );
    });
  }

   /**
   * Writes the home and away standings to file.
   * 
   * @async
   * @private
   * @param league - The league name used for file naming.
   * @returns void Promise - Resolves when the standings are written.
   */
  private async writeStandingsToFile(league: string): Promise<void> {
    await Promise.all([
      writeParsedData(league, "homeStanding", this.storeHomeStanding),
      writeParsedData(league, "awayStanding", this.storeAwayStanding)
    ]);
  }

   /**
   * Updates the standing for a specified team based on the match results.
   *
   * This function checks if the team already exists in the standings map. If the
   * team exists, it updates the existing standing with the new match results.
   * If the team does not exist, it creates a new standing entry for the team.
   *
   * @private
   * @param standings - A Map that stores the standings of teams.
   * @param team - The name of the team to be updated.
   * @param teamScore - The score achieved by the team in the match.
   * @param opponentScore - The score achieved by the opponent team.
   */
  private updateTeamStanding(
    standings: Map<string, HomeAwayStanding>,
    team: string,
    teamScore: number,
    opponentScore: number,
  ): void {
    const doesTeamExists = standings.get(team);
    const outcome = this.determineOutcome(teamScore, opponentScore);
    if (doesTeamExists) {
      this.updateExistingStanding(
        doesTeamExists,
        teamScore,
        opponentScore,
        outcome,
      );
    } else {
      standings.set(
        team,
        this.createNewStanding(teamScore, opponentScore, outcome),
      );
    }
  }

  /**
   * Determines the outcome of a match based on the scores of the two teams.
   *
   * This function compares the scores of two teams and returns the outcome as
   * either 'win', 'loss', or 'draw'.
   *
   * @private
   * @param score1 - The score of the first team.
   * @param score2 - The score of the second team.
   * @returns Outcome - of the match as an Outcome type ('win', 'loss', or 'draw').
   */
  private determineOutcome(score1: number, score2: number): Outcome {
    return score1 > score2 ? "win" : score1 < score2 ? "loss" : "draw";
  }

  /**
   * Creates a new standing entry for a team based on the match results.
   *
   * @private
   * @param teamScore - The score achieved by the team.
   * @param opponentScore - The score achieved by the opponent team.
   * @param Outcome - The outcome of the match ('win', 'loss', or 'draw').
   * @returns HomeAwayStanding - A new standing object representing the team's performance.
   */
  private createNewStanding(
    teamScore: number,
    opponentScore: number,
    outcome: Outcome,
  ): HomeAwayStanding {
    return {
      GP: 1, // Games Played
      W: outcome === "win" ? 1 : 0, // Wins
      D: outcome === "draw" ? 1 : 0, // Draws
      L: outcome === "loss" ? 1 : 0, // Losses
      GF: teamScore, // Goals For
      GA: opponentScore, // Goals Against
      GD: teamScore - opponentScore, // Goal Difference
      Pts: outcome === "win" ? 3 : outcome === "draw" ? 1 : 0, // Points
    };
  }

  /**
   * Updates an existing standing entry for a team based on the match results.
   *
   * @private
   * @param team - The existing standing for the team to be updated.
   * @param teamScore - The score achieved by the team.
   * @param opponentScore - The score achieved by the opponent team.
   * @param Outcome - of the match ('win', 'loss', or 'draw').
   */
  private updateExistingStanding(
    team: HomeAwayStanding,
    teamScore: number,
    opponentScore: number,
    outcome: Outcome,
  ): void {
    team.GP += 1; // Increment Games Played
    team.GF += teamScore; // Increment Goals For
    team.GA += opponentScore; // Increment Goals Against
    team.GD += teamScore - opponentScore; // Update Goal Difference

    if (outcome === "win") {
      team.W += 1; // Increment Wins
      team.Pts += 3; // Add 3 points for a win
    } else if (outcome === "draw") {
      team.D += 1; // Increment Draws
      team.Pts += 1; // Add 1 point for a draw
    } else if (outcome === "loss") {
      team.L += 1; // Increment Losses
    }
  }
}

const standings = new GenerateHomeAwayStandings();
await standings.processFixtures();
