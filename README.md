A [Visual Studio Code](https://code.visualstudio.com/) [extension](https://marketplace.visualstudio.com/items?itemName=donjayamanne.vscode-jupytext) that provides ability to open and execute script files as Jupyter Notebooks.

## Like the UI of Jupyter Notebooks, but prefer to use plain text files, this is the extension for you.

<img src=https://raw.githubusercontent.com/notebookPowerTools/vscode-jupytext/main/images/main.gif>


# Features
* Open and execute script files as Jupyter Notebooks
* Editing/Updating notebooks will result in the corresponding source script file getting updated
* Notebook file doesn't exist on disc (hence no need to manage two files and manage syncing the two).

# Requirements
* Jupyter Extension
* VS Code Insiders (VS Code Stable is not yet supported)
* Python (temporary, see `Roadmap`)

# Getting Started
* Please install VS Code Insiders (stable is not yet supported)
* Install this extension
* Launch VS Code with the following command line `code-insiders --enable-proposed-api=donjayamanne.vscode-jupytext`
* Right click a file and select `Open as a Jupyter Notebook`
* Start executing code against Jupyter Kernels, save changes to notebook will result in the corresponding script file getting updated.


### Based on the [Jupytext](https://github.com/mwouts/jupytext)
* This extension merely atttempts to provide the same functionality as Jupytext, but in  VSCode.
* The Jupytext package is bundled with the extension and used where `Python` is avaialble.
* Opening `Python` and some files such as `rmd` or `markdown` will require `Python` runtime for now


### Roadmap
* Remove dependency on `Python` runtime for script files such as `TypeScript, JavaScript, Rust, C#, F#, etc`
* Seemless editing of both script file and notebook together
* Support metadata in script files (currently metadata might not be saved)
* Configuration of formats (metdata)
