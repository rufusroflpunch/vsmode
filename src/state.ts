import { Mode } from './mode'
import { commandRegistry } from './commands'
import * as utils from './utils'
import * as pairs from './pairs'
import * as vscode from 'vscode'

export class ModalState {
  public currentMode: Mode;
  public searchForward = true;
  private repeatCounter: string;
  
  constructor() {
    this.resetState();    
  }

  resetState() {
    this.setMode(Mode.Selection);
    this.resetCursor();
    this.repeatCounter = "";
  }

  async processCommand(cmd: string) {
    if (this.currentMode === Mode.Insert) {
      const selection = vscode.window.activeTextEditor.selections[0];
      const pos = selection.active;
      let nextCursorDir: utils.CursorDirection;
      const document = await vscode.window.activeTextEditor.edit((textEdit) => {
        if (cmd === '<BS>') { this.deletePreviousChar(textEdit, pos); }
        else if (pairs.isBracket(cmd)) { nextCursorDir = this.insertBracket(textEdit, pos, cmd); }
        else if (pairs.isQuote(cmd)) { nextCursorDir = this.insertQuote(textEdit, pos, cmd); }
        else { textEdit.insert(pos,cmd); }
      });
      // After inserting a quote or bracket, the cursor may have to move
      if (nextCursorDir) { utils.moveCursor(nextCursorDir); }
      return;
    }

    // Some commands can be repeated some number of times.
    if (cmd.match(/\d{1}/)) {
      this.repeatCounter += cmd;
      return;
    }

    if (this.currentMode === Mode.Selection && commandRegistry[cmd]) {
      // Only execute once if the command is not repeatable or number is imparseable
      let counter: number;
      if (commandRegistry[cmd].repeatable) {
        counter = parseInt(this.repeatCounter) || 1;
      } else {
        counter = 1;
      }

      for (let i = 1; i <= counter; i++) {
        await commandRegistry[cmd].exec(this);
      }
    } else if (this.currentMode === Mode.CharacterFind) {
      commandRegistry["findChar"].exec(this, cmd, this.searchForward);
    } else if (this.currentMode === Mode.CharacterTo) {
      commandRegistry["toChar"].exec(this, cmd, this.searchForward);
    }
    this.repeatCounter = "";
    this.searchForward = true;
  }

  setMode(mode: Mode) {
    this.currentMode = mode;
    switch(mode) {
      case Mode.Insert:
        vscode.window.activeTextEditor.options.cursorStyle = vscode.TextEditorCursorStyle.Line;
        this.resetCursor(); // Clear selection in insert mode
        break;
      default:
        vscode.window.activeTextEditor.options.cursorStyle = vscode.TextEditorCursorStyle.Underline;
        break;
    }
  }

  resetCursor() {
    let newSelections: vscode.Selection[] = [];
    for (let selection of vscode.window.activeTextEditor.selections) {
      let cursorPos = selection.active;
      newSelections.push(new vscode.Selection(cursorPos, cursorPos));
    }
    vscode.window.activeTextEditor.selections = newSelections;
  }

  private insertBracket(textEdit: vscode.TextEditorEdit, pos: vscode.Position, cmd: string): utils.CursorDirection {
    if (pairs.openable(cmd)) {
      textEdit.insert(pos, cmd);
      textEdit.insert(pos, pairs.hasMatch(cmd));
      return utils.CursorDirection.Left;
    } else {
      return utils.CursorDirection.Right;
    }
  }

  private insertQuote(textEdit: vscode.TextEditorEdit, pos:vscode.Position, cmd: string): utils.CursorDirection {
    // If you're entering a quote that already exists, then it's probably a closing quote, so skip it
    if (utils.getChar(pos) == cmd) {
      return utils.CursorDirection.Right;
    } else {
      textEdit.insert(pos, cmd);
      textEdit.insert(pos, cmd);
      return utils.CursorDirection.Left;
    }
  }

  private async deletePreviousChar(textEdit: vscode.TextEditorEdit, pos: vscode.Position) {
    let char = utils.getChar(pos.translate({characterDelta: -1}));
    let nextChar = utils.getChar(pos);
    if (pairs.isQuote(char)) {
      await vscode.commands.executeCommand('deleteLeft');
      if (char === nextChar) { await vscode.commands.executeCommand('deleteRight'); }
    } else {
      await vscode.commands.executeCommand('deleteLeft');
    }
  }
}