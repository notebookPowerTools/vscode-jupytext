// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  EventEmitter,
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  notebook,
  NotebookCellStatusBarItemProvider,
  NotebookCell,
  CancellationToken,
  NotebookCellStatusBarItem,
  window,
  TextEditorSelectionChangeEvent,
  TextDocument,
  Position,
  Disposable,
  NotebookCellStatusBarAlignment,
  NotebookEditorSelectionChangeEvent,
  CodeActionProvider,
  Range,
  Selection,
  CodeActionContext,
  languages,
  DocumentHighlightProvider,
  workspace,
  StatusBarItem,
  StatusBarAlignment,
} from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-notebook-cell-linenumber" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand(
    "vscode-notebook-cell-linenumber.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      window.showInformationMessage(
        "Hello World from vscode-notebook-cell-linenumber!"
      );
    }
  );

  context.subscriptions.push(disposable);
  const provider = new StatusbarProvider(context);
  context.subscriptions.push(provider);
}

class StatusbarProvider implements NotebookCellStatusBarItemProvider {
  public get onDidChangeCellStatusBarItems() {
    return this._onDidChangeCellStatusBarItems.event;
  }
  private readonly disposables: Disposable[] = [];
  private _lineLocation?: "cellstatusbar" | "statusbar";
  private readonly _onDidChangeCellStatusBarItems = new EventEmitter<void>();
  private cellStatusbarProvider?: Disposable;
  private statusbar?: StatusBarItem;
  private readonly textDocumentPositions = new WeakMap<
    TextDocument,
    Position
  >();
  private get lineLocation(): "cellstatusbar" | "statusbar" {
    if (!this._lineLocation) {
      this._lineLocation = workspace
        .getConfiguration("notebook")
        .get<"cellstatusbar" | "statusbar">(
          "cursorPositionLocation",
          "statusbar"
        );
    }
    return this._lineLocation;
  }

  /**
   * The provider will be called when the cell scrolls into view, when its content, outputs, language, or metadata change, and when it changes execution state.
   */
  constructor(private readonly context: ExtensionContext) {
    this.registerProviders();
    workspace.onDidChangeConfiguration(
      this.onDidChangeConfiguration,
      this,
      this.disposables
    );
    window.onDidChangeTextEditorSelection(
      this.onDidChangeTextEditorSelection,
      this,
      this.disposables
    );
    window.onDidChangeNotebookEditorSelection(
      this.onDidChangeNotebookEditorSelection,
      this,
      this.disposables
    );
  }
  public dispose() {
    this._onDidChangeCellStatusBarItems.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.cellStatusbarProvider?.dispose();
  }
  public provideCellStatusBarItems(
    cell: NotebookCell,
    _token: CancellationToken
  ): NotebookCellStatusBarItem[] {
    if (this.lineLocation === "statusbar") {
      return [];
    }
    const activeEditor = window.activeNotebookEditor;
    if (!activeEditor || activeEditor.document !== cell.notebook) {
      return [];
    }
    if (
      !activeEditor.selections.some(
        (range) => range.start <= cell.index && range.end > cell.index
      )
    ) {
      return [];
    }
    const item = this.textDocumentPositions.get(cell.document);
    if (!item) {
      return [];
    }

    const line = item.line;
    const character = item.character;
    return [
      new NotebookCellStatusBarItem(
        `Ln ${line + 1}, Col ${character + 1}`,
        NotebookCellStatusBarAlignment.Left,
        undefined,
        undefined,
        999999999999999
      ),
    ];
  }
  private registerProviders() {
    if (this.lineLocation === "statusbar") {
      this.statusbar = window.createStatusBarItem({
        id: "notebookLinePosition",
        name: "notebookLine",
        alignment: StatusBarAlignment.Right,
        priority: 9999999999,
      });
    } else {
      this.statusbar?.hide();
      if (!this.cellStatusbarProvider) {
        this.cellStatusbarProvider = notebook.registerNotebookCellStatusBarItemProvider(
          { viewType: "*" },
          this
        );
      }
    }
  }
  private doesDocumentBelongToCurrentNotebook(document: TextDocument) {
    const activeEditor = window.activeNotebookEditor;
    return activeEditor?.document === document.notebook;
  }
  private onDidChangeNotebookEditorSelection(
    e: NotebookEditorSelectionChangeEvent
  ) {
    console.error("1");
  }
  private onDidChangeTextEditorSelection(e: TextEditorSelectionChangeEvent) {
    const document = e.textEditor.document;
    if (document.notebook) {
      if (e.selections.length) {
        this.textDocumentPositions.set(
          e.textEditor.document,
          e.selections[0].start
        );
        if (this.statusbar && this.lineLocation === "statusbar") {
          this.statusbar.text = `Ln ${e.selections[0].start.line + 1}, Col ${
            e.selections[0].start.character + 1
          }`;
          this.statusbar.show();
        }
      } else {
        this.statusbar?.hide();
        this.textDocumentPositions.delete(e.textEditor.document);
      }
      if (this.doesDocumentBelongToCurrentNotebook(document)) {
        this._onDidChangeCellStatusBarItems.fire();
      }
    }
  }
  private onDidChangeConfiguration(e: ConfigurationChangeEvent) {
    if (e.affectsConfiguration("notebook.cursorPositionLocation")) {
      this._lineLocation = undefined;
      this.registerProviders();
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
