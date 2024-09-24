import { writeParsedData } from "./helpers/writeDataToFile.ts";
import { readDataFromFile } from "./helpers/readDataFromFile.ts";
import { loggingHandler } from "./helpers/loggingHandler.ts";
import { AllLeagueStandings, ExtractedFixture, HomeAwayStanding, LeagueData, Outcome } from "./types/datatypes.d.ts";
import { isAllLeagueStandings, isLeagueData, isOutcome } from "./helpers/checkDataType.ts";

class GenerateHomeAwayStandings {

  /**
   * Reads league data from a specified file and processes the received data.
   *
   * This method attempts to read league data from a file whose path is
   * specified in the environment variable. If the data is invalid,
   * an error is logged and the process exits.
   * 
   * @async
   * @returns void Promise Resolves when the data is successfully read and processed.
   * @throws error If there is an error reading the file or processing the data.
   */
  async readLeagueData(): Promise<void> {
    try {
      const FILE_PATH: string = Deno.env.get("READ_LEAGUE_DATA_2024")!;
      const DATA: (LeagueData | AllLeagueStandings)[] = await readDataFromFile(FILE_PATH);
      
      if (!isAllLeagueStandings(DATA)) {
        loggingHandler(`CRITICAL: invalid data format: ${DATA}`);
        Deno.exit(1);
      }
      await this.processReceivedData(DATA);
    } catch (error) {
      loggingHandler(`ERROR: reading league data: ${error.message}`);
    }
  }

  /**
   * Processes the received league data.
   *
   * This method takes an array of league data and processes each league
   * concurrently using the processLeague method.
   *
   * @async
   * @param {Array<LeagueData | AllLeagueStandings>} DATA - The array of league data to process.
   * @returns {Promise<void>} Resolves when all leagues have been processed.
   * @throws {Error} If there is an error processing the leagues.
   */
  private async processReceivedData(DATA: (LeagueData | AllLeagueStandings)[]): Promise<void> {
    try {
      const leaguePromises = DATA.map((leagues) => this.processLeague(leagues));
      await Promise.all(leaguePromises);
    } catch (error) {
      loggingHandler(`Error processing leagues: ${error}`);
    }
  }

   /**
   * Processes a single league's data.
   *
   * This method updates the home and away standings based on the fixtures
   * from the league and saves the standings to a file.
   *
   * @async
   * @param LeagueData | AllLeagueStandings - The league data to process.
   * @returns void Promise Resolves when the standings are saved to file.
   */
  private async processLeague(leagues: LeagueData | AllLeagueStandings): Promise<void> {
    
    if (isLeagueData(leagues)) {
      for (const [league, fixtures] of Object.entries(leagues)) {
        const homeStandings = new Map<string, HomeAwayStanding>();
        const awayStandings = new Map<string, HomeAwayStanding>();

        this.processFixtures(fixtures, homeStandings, awayStandings);

        await this.saveStandingsToFile(league, homeStandings, awayStandings)
      }
    }
  }

  /**
   * Saves the standings to a file.
   *
   * This method writes both home and away standings to their respective files.
   *
   * @async
   * @param {string} leagueName - The name of the league for which standings are being saved.
   * @param {Map<string, HomeAwayStanding>} homeStandings - The home standings to save.
   * @param {Map<string, HomeAwayStanding>} awayStandings - The away standings to save.
   * @returns {Promise<void>} Resolves when the standings are written to the files.
   * @throws If there is an error writing the standings to file.
   */
  private async saveStandingsToFile(leagueName: string, homeStandings: Map<string, HomeAwayStanding>, awayStandings: Map<string, HomeAwayStanding>) {
    try {
      await Promise.all([
        writeParsedData(leagueName, "homeStanding", homeStandings),
        writeParsedData(leagueName, "awayStanding", awayStandings),
      ]);
    } catch (error) {
      loggingHandler(`ERROR writing standings to file: ${error}`);
    }
  }

  /**
   * Processes fixtures to update standings.
   *
   * This method iterates through the fixtures, updating the home and away
   * standings based on the scores of each match.
   *
   * @param {ExtractedFixture[]} fixtures - The list of fixtures to process.
   * @param {Map<string, HomeAwayStanding>} homeStandings - The map to update for home standings.
   * @param {Map<string, HomeAwayStanding>} awayStandings - The map to update for away standings.
   */
  private processFixtures(fixtures: ExtractedFixture[], homeStandings: Map<string, HomeAwayStanding>, awayStandings: Map<string, HomeAwayStanding>) {
      for (const fixture of fixtures) {
        this.updateTeamStandings(fixture.HomeTeam, fixture.HomeTeamScore, fixture.AwayTeamScore, homeStandings);
        this.updateTeamStandings(fixture.AwayTeam, fixture.AwayTeamScore, fixture.HomeTeamScore, awayStandings);
      }
  }

  /**
   * Updates the standings for a specific team.
   *
   * This method checks if the team already exists in the standings and updates them
   * accordingly. If not, it creates new standings for the team.
   *
   * @param {string} team - The name of the team to update standings for.
   * @param {number} teamScore - The score of the team.
   * @param {number} opponentScore - The score of the opponent team.
   * @param {Map<string, HomeAwayStanding>} standings - The standings map to update.
   * @returns {void}
   * @throws If there is an error updating the standings.
   */
  private updateTeamStandings(team: string, teamScore: number, opponentScore: number, standings: Map<string, HomeAwayStanding>) {
    try {
      const doesTeamExist = standings.get(team);
      const outcome = this.determineOutcome(teamScore, opponentScore);
      if(!doesTeamExist){
        standings.set(team, this.createNewStanding(teamScore, opponentScore, outcome));
        return
      }
      this.updateExistingStanding(doesTeamExist, teamScore, opponentScore, outcome);
    } catch (error) {
      loggingHandler(`ERROR: ${error} cannot update/insert data for ${team}`);
    }
  }

   /**
   * Determines the outcome of a match based on scores.
   *
   * @param {number} teamScore - The score of the team.
   * @param {number} opponentScore - The score of the opponent.
   * @returns {string} The outcome of the match ("win", "lose", "draw").
   */
  private determineOutcome(teamScore: number, opponentScore: number) {
    return teamScore > opponentScore ? "win" : teamScore < opponentScore ? "loss" : "draw";
  }

  /**
   * Updates an existing team's standings based on match results.
   *
   * This method modifies the team's standing according to the match outcome,
   * including goals for, goals against, points, and match results.
   *
   * @param {HomeAwayStanding} team - The current standings of the team.
   * @param {number} teamScore - The score of the team in the match.
   * @param {number} opponentScore - The score of the opposing team in the match.
   * @param {string} outcome - The outcome of the match ("win", "draw", "lose").
   * @returns {void}
   * @throws {Error} If the outcome is invalid.
   */
  private updateExistingStanding(team: HomeAwayStanding, teamScore: number, opponentScore: number, outcome: Outcome) {
    team.GP += 1;
    team.GF += teamScore;
    team.GA += opponentScore;
    team.GD += teamScore - opponentScore;
    if (!isOutcome) {
      throw new Error(`ERROR: invalid outcome signature caught trying to update data for ${team}`);
    } else if (outcome === "win") {
      team.W += 1;
      team.Pts += 3;
    } else if (outcome === "draw") {
      team.D += 1;
      team.Pts += 1;
    } else if (outcome === "loss") {
      team.L += 1;
    }
  }
  
  /**
   * Creates a new standing for a team based on match results.
   *
   * @param {number} teamScore - The score of the team in the match.
   * @param {number} opponentScore - The score of the opposing team in the match.
   * @param {string} outcome - The outcome of the match ("win", "draw", "lose").
   * @returns {HomeAwayStanding} The new standing for the team.
   */
  private createNewStanding(teamScore: number, opponentScore: number, outcome: Outcome): HomeAwayStanding {
    return {
      GP: 1,
      W: outcome === "win" ? 1 : 0,
      D: outcome === "draw" ? 1 : 0,
      L: outcome === "loss" ? 1 : 0,
      GF: teamScore,
      GA: opponentScore,
      GD: teamScore - opponentScore,
      Pts: outcome === "win" ? 3 : outcome === "draw" ? 1 : 0,
    };
  }
}