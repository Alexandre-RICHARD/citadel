import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { useNavigate } from "../../hooks/useNavigate";

export const NotFound = (): React.JSX.Element => {
  const [timeLeft, setTimeLeft] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const redirectInterval = setInterval(() => {
      if (timeLeft === 0) {
        navigate("/");
      } else {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(redirectInterval);
  });

  return (
    <div className="flex flex-col items-center">
      <NavLink to="/">
        <p className="hover:font-bold underline">Go back to homepage</p>
      </NavLink>
      <p>404 - You ll be redirected in {timeLeft}s</p>
    </div>
  );
};
