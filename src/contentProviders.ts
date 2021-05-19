import {
    EventEmitter,
    FileChangeEvent,
    FileStat,
    FileSystemProvider,
    FileType,
    Uri,
    workspace,
} from 'vscode';
import { convertFromNotebookToRawContent, getMappingFor } from './conversion';
import * as fs from 'fs-extra';
import { isJupytextScheme, noop } from './constants';

export function initialize() {
    workspace.registerFileSystemProvider(
        'jupytext',
        new JupytextFileSystemProvider(),
        { isCaseSensitive: true, isReadonly: false }
    );
}

function tranlateUri(source: Uri): Uri {
    return Uri.file(source.fsPath);
}

class JupytextFileSystemProvider implements FileSystemProvider {
    constructor() {
        // Enable when we use NB serializer in Jupyter extension.
        // Allowing updating of the script file as well as notebook.

        // workspace.onDidChangeTextDocument((e) => {
        //     notebookSources.forEach((value, key) => {
        //         if (value === e.document.uri.fsPath) {
        //             this.changedFiles.set(key, value);
        //             this._onDidChangeFile.fire([
        //                 {
        //                     type: FileChangeType.Changed,
        //                     uri: Uri.file(key).with({ scheme: 'jupytext' }),
        //                 },
        //             ]);
        //         }
        //     });
        // });
    }
    private readonly _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
    public get onDidChangeFile() {
        return this._onDidChangeFile.event;
    }
    public watch(
        _uri: Uri,
        _options: { recursive: boolean; excludes: string[] }
    ) {
        return {
            dispose: () => {
                //
            },
        };
    }
    async stat(uri: Uri): Promise<FileStat> {
        const mapping = getMappingFor({virtualIpynb: uri});
        if (!isJupytextScheme(uri) || !mapping){
            return workspace.fs.stat(Uri.file(uri.fsPath));
        }
        console.error(`Stat of file ${uri.scheme}:${uri.toString()}`);
        uri = Uri.file(mapping.tempIpynb);
        return workspace.fs.stat(uri);
    }
    readDirectory(
        _uri: Uri
    ): [string, FileType][] | Thenable<[string, FileType][]> {
        // We don't want users to open files in local file system using our custom schene.
        // VS Code will use this API to light up breakcrumbs in the editor.
        // If we do that, then VS Code will end up opening files as though they are in this file scheme (lets not do that).
        return [];
    }
    createDirectory(uri: Uri): void | Thenable<void> {
        return workspace.fs.createDirectory(tranlateUri(uri));
    }
    async readFile(uri: Uri): Promise<Uint8Array> {
        const mapping = getMappingFor({virtualIpynb: uri});
        if (!isJupytextScheme(uri) || !mapping){
            return workspace.fs.readFile(Uri.file(uri.fsPath));
        }
        console.error(`Reading file ${uri.scheme}:${uri.toString()}`);
        uri = Uri.file(mapping.tempIpynb);
        return workspace.fs.readFile(uri);
    }
    async writeFile(
        uri: Uri,
        content: Uint8Array,
        _options: { create: boolean; overwrite: boolean }
    ): Promise<void> {
        const mapping = getMappingFor({virtualIpynb: uri});
        if (!isJupytextScheme(uri) || !mapping){
            await workspace.fs.writeFile(Uri.file(uri.fsPath), content).then(noop, noop);
            return;
        }
        
        // Save ipynb.
        const tempIpynb = Uri.file(mapping.tempIpynb);
        await workspace.fs.writeFile(tempIpynb, content);
        
        // Convert ipynb to script & save that.
        const targetFile = Uri.file(mapping.sourceScript);
        const rawContent = await convertFromNotebookToRawContent(
            tempIpynb,
            Uri.file(mapping.sourceScript)
        );
        return workspace.fs.writeFile(targetFile, rawContent);
    }
    delete(uri: Uri, options: { recursive: boolean }): void | Thenable<void> {
        // How will we end up here?
    }
    rename(
        _oldUri: Uri,
        _newUri: Uri,
        _options: { overwrite: boolean }
    ): void | Thenable<void> {
        // How will we end up here?
    }
    copy?(
        _source: Uri,
        _destination: Uri,
        _options: { overwrite: boolean }
    ): void | Thenable<void> {
        // Do we need this?
        // Will users want to save the virtual notebook as a real ipynb file? Why?
    }
}
