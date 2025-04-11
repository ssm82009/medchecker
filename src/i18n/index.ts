
import { en } from './en';
import { ar } from './ar';

export const translations = {
  en,
  ar
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof en;

// Define the Translations interface explicitly instead of referencing 'en'
export interface Translations {
  appTitle: string;
  medication: string;
  addMedication: string;
  healthCondition: string;
  checkInteractions: string;
  results: string;
  loading: string;
  noInteractions: string;
  interactionsFound: string;
  alternativeSuggestion: string;
  dashboard: string;
  login: string;
  logout: string;
  email: string;
  password: string;
  forgotPassword: string;
  resetPassword: string;
  register: string;
  name: string;
  confirmPassword: string;
  alreadyRegistered: string;
  loginHere: string;
  dontHaveAccount: string;
  registerHere: string;
  welcomeBack: string;
  welcomeMessage: string;
  loginButton: string;
  registerButton: string;
  medications: string;
  interactions: string;
  users: string;
  settings: string;
  overview: string;
  reports: string;
  notifications: string;
  profile: string;
  theme: string;
  language: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  sort: string;
  noResults: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  yes: string;
  no: string;
  confirm: string;
  notFound: string;
  notFoundMessage: string;
  backToHome: string;
  serverError: string;
  serverErrorMessage: string;
  contactSupport: string;
  themeLight: string;
  themeDark: string;
  themePurple: string;
  themeBlue: string;
  themeGreen: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  navbarColor: string;
  footerColor: string;
  fontFamily: string;
  logoText: string;
  logoIcon: string;
  appearanceSettings: string;
  logoSettings: string;
  previewTheme: string;
  resetTheme: string;
  saveAppearance: string;
  appearanceUpdated: string;
  applyTheme: string;
}
