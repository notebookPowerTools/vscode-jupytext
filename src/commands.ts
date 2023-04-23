import { commands, Uri, window, workspace } from 'vscode';
import { JupyterNotebookView, jupytextScheme } from './constants';
import { convertToNotebook } from './conversion';

// see the default values of jupytext.languages in package.json
// this should reflect the set of available languages
// as defined in python-libs/jupytext/languages.py
// >>> from jupytext.languages import _SCRIPT_EXTENSIONS
// >>> langs = sorted(list({ record['language'] for ext, record in _SCRIPT_EXTENSIONS.items()}))
// >>> "\n".join(langs)
export function initialize() {
    const config = workspace.getConfiguration('jupytext');
    // reassemble and remove empty lines if any
    console.log(config);
    const langIds = config.languages.split("\n").filter((x:any) => x);
    commands.executeCommand(
        'setContext',
        'vscode-jupytext.resourceLangIds',
        langIds,
    );

    commands.registerCommand('jupyter.openAsPairedNotebook', async (uri?: Uri) => {
        uri = uri || window.activeTextEditor?.document.uri ;
        if (!uri){
            return;
        }
        const notebookUri = await convertToNotebook(uri);
        if (!notebookUri) {
            return;
        }
        await commands.executeCommand(
            'vscode.openWith',
            Uri.file(notebookUri.virtualIpynb).with({scheme: jupytextScheme}),
            JupyterNotebookView
        );
    });
}
