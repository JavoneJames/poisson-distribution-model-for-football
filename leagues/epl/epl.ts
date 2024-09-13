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
// const storeHomeStanding = {HomeStandings:{}};

function homeStandings(HomeTeam: string, HomeTeamScore: number, AwayTeamScore: number) {
  if (!storeHomeStanding.has(HomeTeam))
    return storeHomeStanding.set(HomeTeam,insertMatchResults(HomeTeamScore, AwayTeamScore));
  if(storeHomeStanding.has(HomeTeam)){
    const temp = storeHomeStanding.get(HomeTeam);
    for(const value of Object.values(temp))
      return value.GP += 1, value.W += 1, value.GF += HomeTeamScore, value.GA += AwayTeamScore, value.GD += HomeTeamScore - AwayTeamScore, value.Pts += 3
  }
}

function insertMatchResults(HomeTeamScore: number, AwayTeamScore: number): object {
  return [{
    GP: 1,
    W: 1,
    D: 0,
    L: 0,
    GF: HomeTeamScore,
    GA: AwayTeamScore,
    GD: HomeTeamScore - AwayTeamScore,
    Pts: 3
  }];
}

function awayStandings(temp: string) {
  //console.log(`Away win ${temp}`);
}

readDataFromFile();
console.log(storeHomeStanding);
