import React from "react";

import { itemPerMinute } from "../../../helpers/itemPerMinute.helper";
import { useCombinedStore } from "../../../store/combined.store";
import type { ItemsInOutType } from "../../../types/satisfactory/itemsInOut.type";
import styles from "./styles.module.scss";

type Props = {
  resource: ItemsInOutType;
  cycleDuration: number;
};

export const ResourceBox = ({
  resource,
  cycleDuration,
}: Props): React.JSX.Element => {
  const minuteCalculation = useCombinedStore(
    (state) => state.minuteCalculation,
  );

  const getItemCount = (cycleItemCount: number) => {
    if (!minuteCalculation) return cycleItemCount;
    return itemPerMinute({ cycleDuration, cycleItemCount });
  };

  return (
    <div
      key={resource.item.name}
      className={styles.resource_in_out}
    >
      <img
        className={styles.resource_icon}
        alt={`Icon of ${resource.item.name} satisfactory resource`}
        src={
          new URL(
            `/src/assets/images/satisfactory/gameItems/Resource/${resource.item.name}.png`,
            import.meta.url,
          ).href
        }
      />
      <p className={styles.resource_count}>
        {getItemCount(resource.quantityPerCycle)}
      </p>
    </div>
  );
};
