/**
 * The names of the Argdown syntax rules.
 * The parser plugin returns an abstract syntax tree in [[IArgdownResponse.ast]] in which each node is either an [[IRuleNode]] with one of these names or an [[ITokenNode]].
 * These names can be used to register [[IArgdownPlugin.ruleListeners]]:
 * You can register listeners for each `[RuleName.SOME_RULE + "Entry"]` or `[RuleName.SOME_RULE + "Exit"]`.
 */
export enum RuleNames {
  ARGDOWN = "argdown",
  HEADING = "heading",
  PCS = "pcs",
  PCS_TAIL = "pcsTail",
  ARGUMENT_STATEMENT = "argumentStatement",
  INFERENCE = "inference",
  INFERENCE_RULES = "inferenceRules",
  ORDERED_LIST = "orderedList",
  UNORDERED_LIST = "unorderedList",
  ORDERED_LIST_ITEM = "orderedListItem",
  UNORDERED_LIST_ITEM = "unorderedListItem",
  ARGUMENT_REFERENCE = "argumentReference",
  ARGUMENT_DEFINITION = "argumentDefinition",
  STATEMENT_REFERENCE = "statementReference",
  STATEMENT = "statement",
  STATEMENT_CONTENT = "statementContent",
  STATEMENT_DEFINITION = "statementDefinition",
  RELATIONS = "relations",
  INCOMING_ATTACK = "incomingAttack",
  INCOMING_SUPPORT = "incomingSupport",
  INCOMING_UNDERCUT = "incomingUndercut",
  CONTRADICTION = "contradiction",
  OUTGOING_ATTACK = "outgoingAttack",
  OUTGOING_SUPPORT = "outgoingSupport",
  OUTGOING_UNDERCUT = "outgoingUndercut",
  BOLD = "bold",
  ITALIC = "italic",
  FREESTYLE_TEXT = "freestyleText"
}
