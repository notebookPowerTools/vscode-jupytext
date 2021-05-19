import { spawn } from 'child_process';
import { extensions, Uri } from 'vscode';
import * as path from 'path';
import { getExtensionDir } from './constants';
import { rejects } from 'assert';

let usePython: 'command' | 'extension' | undefined;
type Resource = Uri | undefined;
type IPythonExtensionApi = {
    /**
     * Return internal settings within the extension which are stored in VSCode storage
     */
    settings: {
        /**
         * Returns all the details the consumer needs to execute code within the selected environment,
         * corresponding to the specified resource taking into account any workspace-specific settings
         * for the workspace to which this resource belongs.
         * @param {Resource} [resource] A resource for which the setting is asked for.
         * * When no resource is provided, the setting scoped to the first workspace folder is returned.
         * * If no folder is present, it returns the global setting.
         * @returns {({ execCommand: string[] | undefined })}
         */
        getExecutionDetails(resource?: Resource): {
            /**
             * E.g of execution commands returned could be,
             * * `['<path to the interpreter set in settings>']`
             * * `['<path to the interpreter selected by the extension when setting is not set>']`
             * * `['conda', 'run', 'python']` which is used to run from within Conda environments.
             * or something similar for some other Python environments.
             *
             * @type {(string[] | undefined)} When return value is `undefined`, it means no interpreter is set.
             * Otherwise, join the items returned using space to construct the full execution command.
             */
            execCommand: string[] | undefined;
        };
    };
};
export async function isPythonAvaialble(): Promise<boolean> {
    const pythonCmd = testPythonCommand().catch(() => false);
    const pythonExt = testPythonExtCommand().catch(() => false);

    const [cmdSupported, extSupported] = await Promise.all([
        pythonCmd,
        pythonExt,
    ]);
    if (extSupported) {
        usePython = 'extension';
        return true;
    }
    if (cmdSupported) {
        usePython = 'command';
        return true;
    }
    return false;
}
async function testPythonExtCommand(): Promise<boolean> {
    const pyExt =
        extensions.getExtension<IPythonExtensionApi>('ms-python.python');
    if (!pyExt) {
        return false;
    }
    if (!pyExt.isActive) {
        try {
            await pyExt.activate();
        } catch (ex) {
            console.error(`Failed to activate Python Extension`, ex);
            return false;
        }
    }
    const cli = pyExt.exports.settings.getExecutionDetails(undefined);
    if (!cli.execCommand) {
        return false;
    }
    const cmd = cli.execCommand?.concat(
        'c',
        'import sys;print(sys.executable);print(sys.version)'
    );
    return supportsPython(cmd);
}
function buildCmd(cmdArgs: string[]) {
    return cmdArgs.map((item) => item.replace(/\\/g, '/'));
}
async function supportsPython(cmdArgs: string[]): Promise<boolean> {
    try {
        const output = await runPythonCommand(cmdArgs);
        if (output.length === 0) {
            return false;
        }
        return output
            .split(/\r?\n/)
            .map((line) => line.trim())
            .some((line) => line.startsWith('3.'));
    } catch (ex) {
        console.error('Failed to find python', ex);
        return false;
    }
}
export async function runPythonCommand(cmdArgs: string[]): Promise<string> {
    const [cmd, ...args] = buildCmd(cmdArgs);
    const env: NodeJS.ProcessEnv = {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONIOENCODING: process.env['PYTHONIOENCODING'] || 'utf-8',
    };

    const proc = spawn(cmd, args, {
        cwd: path.join(getExtensionDir().fsPath, 'python-libs'),
        env,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => {
        stdout += data.toString('utf8');
    });
    proc.stderr.on('data', (data) => {
        stderr += data.toString('utf8');
    });
    return new Promise<string>((resolve, reject) => {
        proc.on('error', (_code: number) => {
            return reject(stderr);
        });
        proc.on('exit', (code: number) => {
            if (code > 0) {
                return reject(stderr);
            }
            resolve(stdout);
        });
        proc.on('close', () => resolve(stdout));
    });
}
export async function runJupytext(cmdArgs: string[]): Promise<string> {
    return runPythonCommand(['python'].concat(cmdArgs));
}
async function testPythonCommand(): Promise<boolean> {
    const cmd = [
        'python',
        'c',
        'import sys;print(sys.executable);print(sys.version)',
    ];
    return supportsPython(cmd);
}
