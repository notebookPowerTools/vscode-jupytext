import { Uri, window } from "vscode";
import { isConversionSupportedWithoutPython } from "./languages";
import { isPythonAvaialble } from "./python";

export async function openFileAsPairedNotebook(uri: Uri){
    const isPythonAvailable = await isPythonAvaialble();
    if (!isPythonAvaialble && !isConversionSupportedWithoutPython(uri)){
        window.showErrorMessage('Unable to open file as a paired notebook with Python installed');
        return;
    }
}