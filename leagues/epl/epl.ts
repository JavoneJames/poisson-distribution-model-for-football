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
function homeStandings(HomeTeam: string, HomeTeamScore: number, AwayTeamScore: number) {
  const temp = new Set()
  if(!storeHomeStanding.has(HomeTeam)){
    storeHomeStanding.set(HomeTeam, temp.add([1,1,0,0,HomeTeamScore,AwayTeamScore,HomeTeamScore-AwayTeamScore,3]))
  }
  console.log(storeHomeStanding);
}

function awayStandings(temp: string) {
  //console.log(`Away win ${temp}`);
}

readDataFromFile();