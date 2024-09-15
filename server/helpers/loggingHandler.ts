// Define constant options for date and time formatting using 'as const'
const OPTIONS = {
  dateStyle: "short",  // Sets the date style to 'short', e.g., '09/15/2024'.
  timeStyle: "medium"  // Sets the time style to 'medium', e.g., '3:00:00 PM'.
} as const;

// Exported function to handle logging with a reason provided as a parameter.
export function loggingHandler(reason: string): void {
  const timestamp = new Date().toLocaleString("en-GB", OPTIONS);
  const logMessage = `${timestamp} - ${reason}\n`;
  const logfilePath = Deno.env.get("LOG_FILE");
  if (!logfilePath) throw new Error("File path not found in environment variable.");
  Deno.writeTextFileSync(logfilePath, logMessage, { create: true, append: true });
}
