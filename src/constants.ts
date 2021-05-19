import { Disposable, ExtensionContext, Memento, Uri, workspace } from 'vscode';

export const noop = () => {
    //
};

export const jupytextScheme = 'jupytext';
export function isJupytextScheme(uri:Uri){
    return uri.scheme === jupytextScheme;
}
export const JupyterNotebookView = 'jupyter-notebook';

let extensionDir: Uri;
let globalMemento: Memento;
export function getExtensionDir(): Uri {
    return extensionDir;
}
export function getGlobalCache(): Memento {
    return globalMemento;
}
let disposables:Disposable [];
export function registerDisposable(disposable: Disposable) {
    disposables.push(disposable);
}
let globalTempDir:Uri;
export function getGlobalTempDir(): Uri {
    return globalTempDir;
}
export async function initialize(context: ExtensionContext) {
    extensionDir = context.extensionUri;
    globalMemento = context.globalState;
    disposables = context.subscriptions;
    globalTempDir = context.globalStorageUri;
    await workspace.fs.createDirectory(context.globalStorageUri).then(noop, noop);
}
