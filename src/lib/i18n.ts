/**
 * 国際化（i18n）ユーティリティ
 */

export type MessageKey =
  | "extensionName"
  | "extensionDescription"
  | "loading"
  | "settings"
  | "projectNotSet"
  | "openSettings"
  | "titleLabel"
  | "urlLabel"
  | "tabError"
  | "initError"
  | "savedSuccess"
  | "saveButton"
  | "savedButton"
  | "projectPrefix"
  | "optionsSubheader"
  | "projectSectionTitle"
  | "projectSectionDesc"
  | "projectNameLabel"
  | "destinationLabel"
  | "saveButtonLabel"
  | "savingButton"
  | "optionsSavedSuccess"
  | "optionsSaveError"
  | "behaviorTitle"
  | "openOnSaveLabel"
  | "openOnSaveDesc"
  | "howToTitle"
  | "howToStep1"
  | "howToStep2"
  | "howToStep3"
  | "howToStep4"
  | "contextMenuSave";

export function t(key: MessageKey): string {
  const msg = browser.i18n.getMessage(key);
  return msg || key;
}
