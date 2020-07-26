import * as vscode from "vscode";

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function () {
  const tokenTypesLegend: string[] = [];
  tokenTypesLegend.forEach((tokenType, index) =>
    tokenTypes.set(tokenType, index)
  );

  const tokenModifiersLegend: string[] = [];
  tokenModifiersLegend.forEach((tokenModifier, index) =>
    tokenModifiers.set(tokenModifier, index)
  );

  return new vscode.SemanticTokensLegend(
    tokenTypesLegend,
    tokenModifiersLegend
  );
})();

export function activate(context: vscode.ExtensionContext) {
  console.debug("Activating KeyValues.vscode extension");

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: "keyvalues" },
      new DocumentSemanticTokensProvider(),
      legend
    )
  );
}

class DocumentSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder();
    return builder.build();
  }
}
