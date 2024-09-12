function readDataFromFile(): void {
  const fileContent: string = Deno.readTextFileSync(`${Deno.env.get("READ_EPL_2024")}`);
  const parseToJSON: JSON = JSON.parse(fileContent)
  differentiateMatchResults(parseToJSON)
}

function differentiateMatchResults(data: JSON) {
  Object.values(data).map((fixture)=>{
    if(fixture.HomeTeamScore > fixture.AwayTeamScore)
      homeStandings(fixture.HomeTeam)
    else if (fixture.HomeTeamScore < fixture.AwayTeamScore)
      awayStandings(fixture.AwayTeam)
    else console.log("TO-DO add drawn games to home and away standings");
    
  })
}

function homeStandings(temp: string) {
  console.log(`Home win ${temp}`);
}

function awayStandings(temp: string) {
  console.log(`Away win ${temp}`);
}

readDataFromFile();