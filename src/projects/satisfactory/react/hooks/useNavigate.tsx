import { useCallback } from "react";
import { useNavigate as useNav } from "react-router-dom";

export const useNavigate = () => {
  const navigate = useNav();

  return useCallback(
    (linkTo: string) => {
      try {
        Promise.resolve(navigate(linkTo)).catch((error) =>
          console.error("useNavigate.tsx:: =>", error),
        );
      } catch (error) {
        console.error("useNavigate.tsx:: =>", error);
      }
    },
    [navigate],
  );
};
