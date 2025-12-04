import { type CountryEnum } from "@nexus/nexusExporter";
import React from "react";

type PropsType = {
  country: CountryEnum;
};

export const LanguageSelectorFlag = ({
  country,
}: PropsType): React.JSX.Element => {
  return (
    <img
      alt={`Country flag of ${country}`}
      src={
        new URL(
          `/src/assets/images/languagesFlags/${country}.png`,
          import.meta.url,
        ).href
      }
    />
  );
};
