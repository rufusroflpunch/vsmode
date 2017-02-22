import * as vscode from 'vscode';

/**
 * A generic registry for objects, using strings as the key. When creating
 * an instance of the object, define a default register to use when conducting
 * operations.
 */
export class RegisterKeeper<T> {
  private registers = {};

  /**
   * Creates a default registry for items using strings as keys.
   * @param defaultRegister - The default registry to use when accessing items.
   */
  constructor(public defaultRegister: string) {}

  appendToRegister(selection: T, register?: string) {
    register = register || this.defaultRegister;
    if (!this.registers[register]) { this.registers[register] = [] }
    this.registers[register].push(selection);
  }

  getRegister(register?: string): T[] {
    register = register || this.defaultRegister;
    return this.registers[register] || [];
  }

  clearRegister(register?: string) {
    register = register || this.defaultRegister;
    this.registers[register] = [];
  }
}