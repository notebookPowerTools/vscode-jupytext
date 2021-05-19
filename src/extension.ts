// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
} from "vscode";
import { initialize } from "./constants";
import { initialize as initializeCommands } from "./commands";
import { initialize as initializeContentProvider } from "./contentProviders";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  await initialize(context);
  initializeCommands();
  initializeContentProvider();
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-notebook-cell-linenumber" is now active!'
  );
}
