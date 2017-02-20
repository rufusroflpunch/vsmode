'use strict';
import * as vscode from 'vscode';
import { ModalState } from './state'
import { Mode } from './mode'

export function activate(context: vscode.ExtensionContext) {
    let modalState = new ModalState();
    let disposable = vscode.commands.registerCommand('type', (args) => {
        modalState.processCommand(args.text);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.leaveInsertMode', () => {
       modalState.setMode(Mode.Selection);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.findCharacterBackward', () => {
       modalState.setMode(Mode.CharacterFind);
       modalState.searchForward = false;
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.toCharacterBackward', () => {
       modalState.setMode(Mode.CharacterTo);
       modalState.searchForward = false;
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.deletePreviousChar', () => {
        modalState.processCommand('<BS>')
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.selectToLineBegin', () => {
        modalState.processCommand('selectToLineBegin');
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.selectToLineBeginFull', () => {
        modalState.processCommand('selectToLineBeginFull');
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.selectToLineEnd', () => {
        modalState.processCommand('selectToLineEnd');
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vsmode.selectToLineEndFull', () => {
        modalState.processCommand('selectToLineEnd');
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}