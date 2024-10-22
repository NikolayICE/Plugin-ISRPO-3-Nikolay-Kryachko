"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.removeComments', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found!');
            return;
        }
        const document = editor.document;
        const fullText = document.getText();
        // Регулярное выражение для удаления комментариев
        const uncommentedText = fullText
            .replace(/\/\*[\s\S]*?\*\//g, '') // удаление многострочных комментариев
            .replace(/\/\/.*$/gm, ''); // удаление однострочных комментариев
        // Редактируем текст документа
        editor.edit(editBuilder => {
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(document.lineCount, 0);
            const fullRange = new vscode.Range(start, end);
            editBuilder.replace(fullRange, uncommentedText);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage('All comments removed!');
            }
            else {
                vscode.window.showErrorMessage('Failed to remove comments.');
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map