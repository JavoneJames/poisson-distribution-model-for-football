import { writeParsedData } from "./helpers/writeDataToFile.ts";
import { readDataFromFile } from "./helpers/readDataFromFile.ts";
import { AllLeagueStandings, ExtractedFixture, HomeAwayAnalysis, HomeAwayStanding, LeagueData, LeagueStats } from "./types/datatypes.d.ts";
import { loggingHandler } from "./helpers/loggingHandler.ts";
import { isHomeAwayStanding, isTeamEntry } from "./helpers/checkDataType.ts";

class AnalyzeHomeAwayStats {
  /**
   * Reads standings data from files and processes it.
   */
  async readStandingsData() {
    try {
      const HOME_STANDINGS_FILE_PATH = Deno.env.get("READ_HOME_STANDINGS_2024");
      const AWAY_STANDINGS_FILE_PATH = Deno.env.get("READ_AWAY_STANDINGS_2024");

      if (!HOME_STANDINGS_FILE_PATH || !AWAY_STANDINGS_FILE_PATH) {
        loggingHandler("Error: One or both standings file paths not set.");
        return;
      }

      const { homeLeague, awayLeague } = this.extractLeagueIdentifier(HOME_STANDINGS_FILE_PATH, AWAY_STANDINGS_FILE_PATH);

      if (!homeLeague || !awayLeague) {
        loggingHandler("Error: One or both standings file paths not set.");
        return;
      }

      // Read data from files concurrently
      const [homeStanding, awayStanding] = await Promise.all([readDataFromFile(HOME_STANDINGS_FILE_PATH), readDataFromFile(AWAY_STANDINGS_FILE_PATH)]);

      // Process both home and away standings data
      await Promise.all([this.processReceivedData(homeStanding, homeLeague, "home"), this.processReceivedData(awayStanding, awayLeague, "away")]);
    } catch (error) {
      loggingHandler(`Error reading or processing standings: ${error.message}`);
    }
  }

  /**
   * Extracts league identifiers from file paths.
   * @param HOME_STANDINGS_FILE_PATH Path for home standings file.
   * @param AWAY_STANDINGS_FILE_PATH Path for away standings file.
   * @returns An object containing home and away league identifiers.
   */
  private extractLeagueIdentifier(HOME_STANDINGS_FILE_PATH: string, AWAY_STANDINGS_FILE_PATH: string) {
    const homeLeague = HOME_STANDINGS_FILE_PATH.match(/\b[a-zA-Z\-]+-\d{4}\b/g);
    const awayLeague = AWAY_STANDINGS_FILE_PATH.match(/\b[a-zA-Z\-]+-\d{4}\b/g);
    return { homeLeague, awayLeague };
  }

  /**
   * Processes received standings data for home or away games.
   * @param standings The league standings data.
   * @param league The extracted league identifier.
   * @param type The type of fixtures ("home" or "away").
   */
  private async processReceivedData(standings: (LeagueData | AllLeagueStandings)[], league: RegExpMatchArray, type: "home" | "away"): Promise<void> {
    if (!standings.length) {
      loggingHandler(`No standings data found for ${type} fixtures.`);
      return;
    }
    const leagueStatistics = this.initializeLeagueStatistics();
    const storeAnalysis = new Map<string, HomeAwayAnalysis>();

    const arrayOfPromises = standings.map((fixtures, index) => {
      this.processFixtureStats(leagueStatistics, fixtures, storeAnalysis);
      const currentLeague = league[index];
      if (currentLeague) {
        this.saveStandingsToFile(new Map(storeAnalysis), currentLeague, type);
      }
      this.resetAnalysis(storeAnalysis, leagueStatistics);
    });

    await Promise.all(arrayOfPromises);
  }

   /**
   * Saves the analyzed standings data to a file.
   * @param storeAnalysis The analysis results for teams.
   * @param league The league identifier.
   * @param type The type of fixtures ("home" or "away").
   */
  private async saveStandingsToFile(storeAnalysis: Map<string, HomeAwayAnalysis>, league: string | undefined, type: "home" | "away"): Promise<void> {
    try {
      const fileName = type === "home" ? "homeAnalysis" : "awayAnalysis";
      await writeParsedData(league, fileName, storeAnalysis);
    } catch (error) {
      loggingHandler(`Error writing standings to file: ${error}`);
    }
  }

  /**
   * Processes individual fixture statistics and updates the analysis.
   * @param leagueStatistics The statistics object for the league.
   * @param fixtures The fixtures data to process.
   * @param storeAnalysis The map to store analysis results.
   */
  private processFixtureStats(leagueStatistics: LeagueStats, fixtures: LeagueData | AllLeagueStandings, storeAnalysis: Map<string, HomeAwayAnalysis>) {
    this.collectLeagueStats(leagueStatistics, fixtures);
    this.extractRelevantData(leagueStatistics, fixtures, storeAnalysis);
  }

  /**
   * Resets the analysis data for the next set of fixtures.
   * @param storeAnalysis The analysis map to reset.
   * @param leagueStatistics The league statistics object to reset.
   */
  private resetAnalysis(storeHomeAnalysis: Map<string, HomeAwayAnalysis>, leagueHomeStatistics: LeagueStats) {
    storeHomeAnalysis.clear();
    leagueHomeStatistics.totalGF = 0;
    leagueHomeStatistics.totalGA = 0;
  }

  /**
   * Extracts relevant data from the fixtures and updates the analysis for each team.
   * @param leagueStatistics The statistics object for the league.
   * @param fixtures The fixtures data to process.
   * @param storeAnalysis The map to store analysis results.
   */
  private extractRelevantData(leagueStatistics: LeagueStats, fixtures: LeagueData | AllLeagueStandings, storeAnalysis: Map<string, HomeAwayAnalysis>) {
    if (isTeamEntry(fixtures)) {
      for (const team in fixtures) {
        const stats = fixtures[team];
        if (isHomeAwayStanding(stats)) {
          this.updateTeamAnalysisTable(team, leagueStatistics, stats, storeAnalysis);
        }
      }
    }
  }

  /**
   * Updates the analysis table for a specific team based on its stats.
   * @param team The name of the team.
   * @param leagueStatistics The statistics object for the league.
   * @param stats The team's statistics.
   * @param storeAnalysis The map to store analysis results.
   */
  private updateTeamAnalysisTable(team: string, leagueStatistics: LeagueStats, stats: (HomeAwayStanding[] | (ExtractedFixture[] & HomeAwayStanding[])) & HomeAwayStanding, storeAnalysis: Map<string, HomeAwayAnalysis>) {
    const { GP: gamesPlayed = 1, GF: goalsFor = 0, GA: goalsAgainst = 0 } = stats;

    const AHG = goalsFor > 0 ? goalsFor / gamesPlayed : 0;
    const AHCG = goalsAgainst > 0 ? goalsAgainst / gamesPlayed : 0;

    const AS = leagueStatistics.totalGF && stats.GF > 0 ? leagueStatistics.totalGF / stats.GF : 0;
    const DS = leagueStatistics.totalGA && stats.GA > 0 ? leagueStatistics.totalGA / stats.GA : 0;

    storeAnalysis.set(team, { AHG, AHCG, AS, DS });
  }

  /**
   * Initializes the league statistics object.
   * @returns An object containing total goals for and against.
   */
  private initializeLeagueStatistics() {
    return { totalGF: 0, totalGA: 0 };
  }

  /**
   * Collects league statistics from the fixtures.
   * @param leagueStatistics The statistics object to update.
   * @param fixtures The fixtures data to process.
   */
  private collectLeagueStats(leagueStatistics: LeagueStats, fixtures: LeagueData | AllLeagueStandings) {
    if (isTeamEntry(fixtures)) {
      for (const team in fixtures) {
        const teamData = fixtures[team];
        if (isHomeAwayStanding(teamData)) {
          leagueStatistics.totalGF += teamData.GF;
          leagueStatistics.totalGA += teamData.GA;
        }
      }
    }
  }
}