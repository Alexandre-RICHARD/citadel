import React from "react";

import styles from "./styles.module.scss";

type PropsType = {
  id: string;
  value: string;
  setter: (newValue: string) => void;
  label: string;
};

export const InputText = ({
  id,
  value,
  setter,
  label,
}: PropsType): React.JSX.Element => {
  return (
    <label
      htmlFor={id}
      className={styles.text_input_container}
    >
      {label}
      <input
        className={styles.text_input}
        id={id}
        type="text"
        value={value}
        onChange={(event) => setter(event.currentTarget.value)}
      />
    </label>
  );
};
