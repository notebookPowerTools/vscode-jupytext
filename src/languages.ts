import { Uri } from "vscode"

// NOTE
// this is actually not used
//
// export const supportedFileExtensions = {
//     ".py": {"language": "python", "comment": "#"},
//     ".coco": {"language": "coconut", "comment": "#"},
//     ".R": {"language": "R", "comment": "#"},
//     ".r": {"language": "R", "comment": "#"},
//     ".jl": {"language": "julia", "comment": "#"},
//     ".cpp": {"language": "c++", "comment": "//"},
//     ".ss": {"language": "scheme", "comment": ";;"},
//     ".clj": {"language": "clojure", "comment": ";;"},
//     ".scm": {"language": "scheme", "comment": ";;"},
//     ".sh": {"language": "bash", "comment": "#"},
//     ".ps1": {"language": "powershell", "comment": "#"},
//     ".q": {"language": "q", "comment": "/"},
//     ".m": {"language": "matlab", "comment": "%"},
//     ".pro": {"language": "idl", "comment": ";"},
//     ".js": {"language": "javascript", "comment": "//"},
//     ".ts": {"language": "typescript", "comment": "//"},
//     ".scala": {"language": "scala", "comment": "//"},
//     ".rs": {"language": "rust", "comment": "//"},
//     ".robot": {"language": "robotframework", "comment": "#"},
//     ".resource": {"language": "robotframework", "comment": "#"},
//     ".cs": {"language": "csharp", "comment": "//"},
//     ".fsx": {"language": "fsharp", "comment": "//"},
//     ".fs": {"language": "fsharp", "comment": "//"},
//     ".sos": {"language": "sos", "comment": "#"},
//     ".java": {"language": "java", "comment": "//"},
//     ".groovy": {"language": "groovy", "comment": "//"},
//     ".sage": {"language": "sage", "comment": "#"},
// }

export function isConversionSupportedWithoutPython(uri: Uri){
    if (uri.fsPath.toLowerCase().endsWith('.py')){
        return false;
    }
    return true;
}