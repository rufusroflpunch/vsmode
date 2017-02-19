import * as vscode from 'vscode';

export enum CursorDirection {
  Up,
  Down,
  Left,
  Right
}

export function moveCursor(direction: CursorDirection, extend: boolean = false) {
  let delta: {characterDelta?: number, lineDelta?: number};

  switch (direction) {
    case CursorDirection.Up:
      delta = {lineDelta: -1};
      break;
    case CursorDirection.Down:
      delta = {lineDelta: 1};
      break;
    case CursorDirection.Left:
      delta = {characterDelta: -1};
      break;
    case CursorDirection.Right:
      delta = {characterDelta: 1};
      break;
  }

  let newSelections: vscode.Selection[] = [];
  for (let selection of vscode.window.activeTextEditor.selections) {
    let position = selection.active;
    // Translate breaks if we try to translate to a negative line number
    if (direction == CursorDirection.Up && atUpperBounds(position)) { return; }
    if (direction == CursorDirection.Down && atLowerBounds(position)) { return; }
    if (direction == CursorDirection.Left && atLeftBounds(position)) { return; }
    if (direction == CursorDirection.Right && atRightBounds(position)) { return; }
    position = position.translate(delta);
    let anchor = extend ? selection.anchor : position;
    position = vscode.window.activeTextEditor.document.validatePosition(position);
    newSelections.push(new vscode.Selection(anchor, position));
  }
  vscode.window.activeTextEditor.selections = newSelections;
}

export function atLeftBounds(position: vscode.Position): boolean {
  return position.character <= 0;  
}

export function atRightBounds(position: vscode.Position): boolean {
  return position.character >= vscode.window.activeTextEditor.document.lineAt(position.line).text.length;
}

export function atUpperBounds(position: vscode.Position): boolean {
  return position.line <= 0;
}

export function atLowerBounds(position: vscode.Position): boolean {
  return position.line >= vscode.window.activeTextEditor.document.lineCount;
}

export function getChar(position: vscode.Position): string {
  return vscode.window.activeTextEditor.document.getText(
    new vscode.Range(position, position.translate({characterDelta: 1}))
  );
}

export function getEOF(): vscode.Position {
  const document = vscode.window.activeTextEditor.document;
  return document.lineAt(document.lineCount - 1).range.end;
}

export async function goToChar(char: string, include_char: boolean, forward: boolean) {
  let direction: string;
  const document = vscode.window.activeTextEditor.document;
  const start = vscode.window.activeTextEditor.selection.active;
  let text = forward ? getToEof(start) : getToStart(start);
  if (forward) {
    direction = 'right';
  } else {
    direction = 'left';
    text = text.split('').reverse().join('')
  }
  let idx = include_char ? text.indexOf(char) + 1 : text.indexOf(char);
  if (idx <= 0) { return ; }
  for (let c = 0; c < idx; c++) {
    await vscode.commands.executeCommand('cursorMove', {
      to: direction,
      by: 'character',
      value: 1,
      select: true
    });
  }
}

export function getToEof(position: vscode.Position): string {
  return vscode.window.activeTextEditor.document.getText(new vscode.Range(position, getEOF()));
}

export function getToStart(position: vscode.Position): string{
  const start = new vscode.Position(0,0);
  return vscode.window.activeTextEditor.document.getText(new vscode.Range(position, start));
}