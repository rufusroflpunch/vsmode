import * as vscode from 'vscode';
import { ModalState } from './state';
import { Mode } from './mode';
import * as utils from './utils';

export let commandRegistry = {
  "i": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.setMode(Mode.Insert);
    }
  },
  "a": {
    repeatable: false,
    exec: (state: ModalState) => {
      const selection = vscode.window.activeTextEditor.selections[0];
      let position = selection.active.translate({characterDelta: 1});
      position = vscode.window.activeTextEditor.document.validatePosition(position);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(position, position)];
      state.setMode(Mode.Insert);
    }
  },
  "h": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Left, false);
    }
  },
  "H": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Left, true);
    }
  },
  "l": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Right, false);
    }
  },
  "L": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Right, true);
    }
  },
  "j": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Down, false);
    }
  },
  "J": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Down, true);
    }
  },
  "k": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Up, false);
    }
  },
  "K": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Up, true);
    }
  },
  "w": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        let start = selection.active;
        const text = utils.getToEof(start);
        const jump = text.match(/^\w*\s*/)[0].length;
        newSelections.push(
          new vscode.Selection(
            start,
            start.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "W": {
    repeatable: true,
    exec: async (state: ModalState) => {
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        const text = utils.getToEof(selection.active);
        const jump = text.match(/^\w*\s*/)[0].length;
        newSelections.push(
          new vscode.Selection(
            selection.anchor,
            selection.active.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "e": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        let start = selection.active;
        const text = utils.getToEof(start);
        const jump = text.match(/^\s*\w*/)[0].length;
        newSelections.push(
          new vscode.Selection(
            start,
            start.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "E": {
    repeatable: true,
    exec: async (state: ModalState) => {
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        const text = utils.getToEof(selection.active);
        const jump = text.match(/^\s*\w*/)[0].length;
        newSelections.push(
          new vscode.Selection(
            selection.anchor,
            selection.active.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "b": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      await vscode.commands.executeCommand('cursorWordLeftSelect');
    }
  },
  "B": {
    repeatable: true,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('cursorWordLeftSelect');
    }
  },
  "f": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.resetCursor();
      state.setMode(Mode.CharacterFind);
    }
  },
  "F": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.setMode(Mode.CharacterFind);
    }
  },
  "findChar": {
    exec: async (state: ModalState, char: string, forward: boolean) => {
      utils.goToChar(char, true, forward);
      state.setMode(Mode.Selection);
    }
  },
  "t": {
    repeatable: false,
    exec: (state: ModalState, char: string) => {
      state.setMode(Mode.CharacterTo);
    }
  },
  "T": {
    repeatable: false,
    exec: (state: ModalState, char: string) => {
      state.setMode(Mode.CharacterTo);
    }
  },
  "toChar": {
    repeatable: false,
    exec: async (state: ModalState, char: string, forward: boolean) => {
      utils.goToChar(char, false, forward);
      state.setMode(Mode.Selection);
    }
  }
}