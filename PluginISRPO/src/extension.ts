import * as vscode from 'vscode';

let lastRemovedComments: string | null = null; // Храним удаленные комментарии для отката

export function activate(context: vscode.ExtensionContext) {
    // Команда для удаления комментариев
    let removeDisposable = vscode.commands.registerCommand('extension.removeComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const text = document.getText();

            // Диалог для выбора типа комментариев, которые нужно удалить
            const commentType = await vscode.window.showQuickPick(
                ['Удалить все', 'Удалить только однострочные', 'Удалить только многострочные'],
                { placeHolder: 'Выберите, какие комментарии удалить' }
            );

            if (!commentType) {
                return; // Если выбор не сделан, выходим
            }

            // Регулярные выражения для удаления комментариев
            let singleLinePattern = /\/\/.*$/gm;
            let multiLinePattern = /\/\*[\s\S]*?\*\//g;
            let cleanText: string = text;
            let removedComments: string[] = [];

            // Удаляем комментарии в зависимости от выбора пользователя
            if (commentType === 'Удалить все' || commentType === 'Удалить только однострочные') {
                cleanText = cleanText.replace(singleLinePattern, (match) => {
                    removedComments.push(match);
                    return '';
                });
            }
            if (commentType === 'Удалить все' || commentType === 'Удалить только многострочные') {
                cleanText = cleanText.replace(multiLinePattern, (match) => {
                    removedComments.push(match);
                    return '';
                });
            }

            // Если комментарии были удалены
            if (removedComments.length > 0) {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );
                edit.replace(document.uri, fullRange, cleanText);
                await vscode.workspace.applyEdit(edit);

                // Сохраняем удаленные комментарии для возможного отката
                lastRemovedComments = removedComments.join('\n');

                vscode.window.showInformationMessage(`Удалено ${removedComments.length} комментариев.`);

                // Показываем пользователю удаленные комментарии
                vscode.window.showInformationMessage(`Удаленные комментарии:\n${removedComments.join('\n')}`);
            } else {
                vscode.window.showInformationMessage('Комментариев для удаления не найдено.');
            }
        }
    });

    // Команда для возврата удаленных комментариев
    let undoDisposable = vscode.commands.registerCommand('extension.undoRemoveComments', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && lastRemovedComments) {
            const document = editor.document;
            const text = document.getText();

            // Вставляем комментарии в начало документа (или можно по месту, если нужно)
            const newText = lastRemovedComments + '\n' + text;

            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            edit.replace(document.uri, fullRange, newText);
            vscode.workspace.applyEdit(edit);

            vscode.window.showInformationMessage('Комментарии восстановлены.');
            lastRemovedComments = null; // Очищаем сохраненные комментарии после восстановления
        } else {
            vscode.window.showInformationMessage('Нет комментариев для восстановления.');
        }
    });

    context.subscriptions.push(removeDisposable);
    context.subscriptions.push(undoDisposable);
}

export function deactivate() {}
