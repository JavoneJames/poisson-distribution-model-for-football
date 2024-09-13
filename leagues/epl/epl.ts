function readDataFromFile(): void {
  const fileContent: string = Deno.readTextFileSync(`${Deno.env.get("READ_EPL_2024")}`);
  const parseToJSON: JSON = JSON.parse(fileContent)
  differentiateMatchResults(parseToJSON)
}

function differentiateMatchResults(data: JSON) {
  Object.values(data).map((fixture)=>{
    if(fixture.HomeTeamScore > fixture.AwayTeamScore)
      homeStandings(fixture.HomeTeam, fixture.HomeTeamScore, fixture.AwayTeamScore)
    else if (fixture.HomeTeamScore < fixture.AwayTeamScore)
      awayStandings(fixture.AwayTeam, fixture.AwayTeamScore, fixture.HomeTeamScore)
    //else return
  })
}
const storeHomeStanding: Map<string, object> = new Map();
const storeAwayStanding: Map<string, object> = new Map();

function homeStandings(homeTeam: string, homeTeamScore: number, awayTeamScore: number) {
  if (!storeHomeStanding.has(homeTeam))
    storeHomeStanding.set(homeTeam,insertMatchResults(homeTeamScore, awayTeamScore));
  else{
    const results = Object(storeHomeStanding.get(homeTeam)).values();
    updateMatchResults(results, homeTeamScore, awayTeamScore);
  }
}

function awayStandings(awayTeam: string, awayTeamScore: number, homeTeamScore: number) {
  if (!storeAwayStanding.has(awayTeam))
    storeAwayStanding.set(awayTeam,insertMatchResults(awayTeamScore, homeTeamScore));
  else{
    const results = Object(storeAwayStanding.get(awayTeam)).values();
    updateMatchResults(results, awayTeamScore, homeTeamScore);
  }
}

function insertMatchResults(goalFor: number, goalAgainst: number): object {
  return [
    {
      GP: 1,
      W: 1,
      D: 0,
      L: 0,
      GF: goalFor,
      GA: goalAgainst,
      GD: goalFor - goalAgainst,
      Pts: 3,
    },
  ];
}

// deno-lint-ignore no-explicit-any
function updateMatchResults(results: any, homeTeamScore: number, awayTeamScore: number) {
  for (const result of results)
    return result.GP += 1, result.W += 1, result.GF += homeTeamScore, result.GA += awayTeamScore, result.GD += homeTeamScore - awayTeamScore, result.Pts += 3;
}

readDataFromFile();
console.log(storeHomeStanding);
console.log(storeAwayStanding);
