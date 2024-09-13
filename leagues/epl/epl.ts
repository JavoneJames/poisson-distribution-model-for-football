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
      awayStandings(fixture.AwayTeam)
    else return
  })
}
const storeHomeStanding: Map<string, object> = new Map();
const storeAwayStanding: Map<string, object> = new Map();

function homeStandings(homeTeam: string, homeTeamScore: number, awayTeamScore: number) {
  if (!storeHomeStanding.has(homeTeam))
    return storeHomeStanding.set(homeTeam,insertMatchResults(homeTeamScore, awayTeamScore));
  return updateMatchResults(homeTeam, homeTeamScore, awayTeamScore);
}

function updateMatchResults(teamName: string, homeTeamScore: number, awayTeamScore: number) {
  const results = Object(storeHomeStanding.get(teamName)).values();
  for (const result of results)
    return result.GP += 1, result.W += 1, result.GF += homeTeamScore, result.GA += awayTeamScore, result.GD += homeTeamScore - awayTeamScore, result.Pts += 3;
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

function awayStandings(temp: string) {
  //console.log(`Away win ${temp}`);
}

readDataFromFile();
console.log(storeHomeStanding);
