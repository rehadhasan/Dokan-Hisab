import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Graph: undefined;
  Credit: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  ShopSelect: undefined;
  ShopForm: { shopId?: number } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  AddEntry: { entryId?: number } | undefined;
  CategoryManagement: undefined;
  CreditForm: { direction: 'given' | 'taken'; creditId?: number };
  CreditDetail: { creditId: number };
  BackupExport: undefined;
  Donate: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
