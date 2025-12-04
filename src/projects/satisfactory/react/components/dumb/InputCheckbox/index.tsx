import React from "react";

import styles from "./styles.module.scss";

type PropsType = {
  id: string;
  checked: boolean;
  setter: (newValue: boolean) => void;
  label: string;
};

export const InputCheckbox = ({
  id,
  checked,
  setter,
  label,
}: PropsType): React.JSX.Element => {
  return (
    <label
      className={styles.checkbox_input_container}
      htmlFor={id}
    >
      {label}
      <input
        className={styles.checkbox_input}
        id={id}
        checked={checked}
        onChange={() => setter(!checked)}
        type="checkbox"
      />
    </label>
  );
};
