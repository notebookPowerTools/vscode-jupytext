import { commands, Uri, window } from 'vscode';
import { JupyterNotebookView, jupytextScheme } from './constants';
import { convertToNotebook } from './conversion';

export function initialize() {
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
