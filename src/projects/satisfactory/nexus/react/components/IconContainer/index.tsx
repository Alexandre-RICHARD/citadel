import React from "react";

import { IconsList } from "../../../dictionnaries/iconsList.dictionnary";
import type { IconTokenEnum } from "../../../enums/iconToken.enum";

type PropsType = {
  iconToken: IconTokenEnum;
  size: number;
  color?: string;
};

export const IconContainer = ({
  iconToken,
  size,
  color,
}: PropsType): React.JSX.Element => {
  const Icon = IconsList[iconToken];

  const styles = {
    fill: color,
    width: `${size}px`,
    height: `${size}px`,
  };

  return <Icon styles={styles} />;
};
