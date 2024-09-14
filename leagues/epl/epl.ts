type Fixture = {
  HomeTeam: string
  AwayTeam: string
  HomeTeamScore: number
  AwayTeamScore: number
}

type Standing = {
  GP: number  // Games Played
  W: number   // Wins
  D: number   // Draws
  L: number   // Losses
  GF: number  // Goals For
  GA: number  // Goals Against
  GD: number  // Goal Difference
  Pts: number // Points
}

type Outcome = 'win' | 'loss' | 'draw'

// Store standings for home and away teams
const storeHomeStanding: Map<string, Standing> = new Map()
const storeAwayStanding: Map<string, Standing> = new Map()

function readDataFromFile(): void {
  const filePath = Deno.env.get("READ_EPL_2024")
  if (!filePath) throw new Error("File path not found in environment variable.")
  const fileContent = Deno.readTextFileSync(filePath)
  const fixtures: Fixture[] = JSON.parse(fileContent)
  fixtures.forEach(processFixtureResults)
}

function processFixtureResults(fixture: Fixture): void {
  updateTeamStanding(storeHomeStanding, fixture.HomeTeam, fixture.HomeTeamScore, fixture.AwayTeamScore)
  updateTeamStanding(storeAwayStanding, fixture.AwayTeam, fixture.AwayTeamScore, fixture.HomeTeamScore)
}

function updateTeamStanding(standings: Map<string, Standing>, team: string, teamScore: number, opponentScore: number): void {
  const doesTeamExists = standings.get(team)
  const outcome = determineOutcome(teamScore, opponentScore)
  if (doesTeamExists) updateExistingStanding(doesTeamExists, teamScore, opponentScore, outcome)
  else standings.set(team, createNewStanding(teamScore, opponentScore, outcome))
}


function determineOutcome(score1: number, score2: number): Outcome {
  if (score1 > score2) return 'win'
  if (score1 < score2) return 'loss'
  return 'draw'
}

function createNewStanding(teamScore: number, opponentScore: number, outcome: Outcome): Standing {
  return {
    GP: 1,
    W: outcome === 'win' ? 1 : 0,
    D: outcome === 'draw' ? 1 : 0,
    L: outcome === 'loss' ? 1 : 0,
    GF: teamScore,
    GA: opponentScore,
    GD: teamScore - opponentScore,
    Pts: outcome === 'win' ? 3 : outcome === 'draw' ? 1 : 0,
  };
}

function updateExistingStanding(team: Standing, teamScore: number, opponentScore: number, outcome: Outcome): void {
  team.GP += 1
  team.GF += teamScore
  team.GA += opponentScore
  team.GD += teamScore - opponentScore

  if (outcome === 'win') {
    team.W += 1
    team.Pts += 3
  } else if (outcome === 'draw') {
    team.D += 1
    team.Pts += 1
  } else if (outcome === 'loss') {
    team.L += 1
  }
}

readDataFromFile()
console.log(storeHomeStanding)
console.log(storeAwayStanding)
