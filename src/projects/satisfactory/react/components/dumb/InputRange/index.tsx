import React from "react";

import styles from "./styles.module.scss";

type PropsType = {
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  setter: (newValue: number) => void;
  label: string;
};

export const InputRange = ({
  id,
  value,
  min,
  max,
  step,
  setter,
  label,
}: PropsType): React.JSX.Element => {
  return (
    <label
      htmlFor={id}
      className={styles.range_input_container}
    >
      {label}
      <div className={styles.range_slider_container}>
        <input
          className={styles.range_input}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => setter(parseInt(event.currentTarget.value, 10))}
        />
        <p className={styles.range_slider_value}>{value} %</p>
      </div>
    </label>
  );
};
