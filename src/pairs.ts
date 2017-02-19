import * as vscode from 'vscode';

let matchingPairs = {
  "{": {
    match: "}",
    openable: true,
    closeable: false,
    bracket: true,
    quote: false
  },
  "}": {
    match: "{",
    openable: false,
    closeable: true,
    bracket: true,
    quote: false
  },
  "[": {
    match: "]",
    openable: true,
    closeable: false,
    bracket: true,
    quote: false
  },
  "]": {
    match: "[",
    openable: false,
    closeable: true,
    bracket: true,
    quote: false
  },
  "(": {
    match: ")",
    openable: true,
    closeable: false,
    bracket: true,
    quote: false
  },
  ")": {
    match: "(",
    openable: false,
    closeable: true,
    bracket: true,
    quote: false
  },
  '"': {
    match: '"',
    openable: true,
    closeable: true,
    bracket: false,
    quote: true
  },
  "'": {
    match: "'",
    openable: true,
    closeable: true,
    bracket: false,
    quote: true
  },
  "`": {
    match: "`",
    openable: true,
    closeable: true,
    bracket: false,
    quote: true
  }
}

export function hasMatch(bracket: string): string | undefined {
  if (matchingPairs[bracket]) { return matchingPairs[bracket].match; }
}

export function openable(bracket: string): boolean {
  return matchingPairs[bracket] && matchingPairs[bracket].openable;
}

export function closeable(bracket: string): boolean {
  return matchingPairs[bracket] && matchingPairs[bracket].closeable;
}

export function isBracket(bracket: string): boolean {
  return matchingPairs[bracket] && matchingPairs[bracket].bracket;
}

export function isQuote(bracket: string): boolean {
  return matchingPairs[bracket] && matchingPairs[bracket].quote;
}