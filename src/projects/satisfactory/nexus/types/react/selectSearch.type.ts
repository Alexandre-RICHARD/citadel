export type SelectSearchType = {
  strictMode?: boolean;
} & (
  | {
      isHandlingCustomSearch: true;
      customSearchString: string;
      customOnChangeSearch: (newSearchString: string) => void;
    }
  | {
      isHandlingCustomSearch: false;
      customSearchString?: undefined;
      customOnChangeSearch?: undefined;
    }
);
