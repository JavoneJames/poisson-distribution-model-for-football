function readDataFromFile(): void {
  const text: string = Deno.readTextFileSync(`${Deno.env.get("READ_EPL_2024")}`);
  const parseToJSON: JSON = JSON.parse(text)
  
}
readDataFromFile();
