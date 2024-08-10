import React from "react";
import {BarplotDatasetTransition} from "./BarplotDatasetTransition.tsx";

export const BarplotDatasetTransitionDemo = ({ width = 700, height = 400 }) => {
  if (!width || !height) {
    return null;
  }

  return <BarplotDatasetTransition width={width} height={height} />;
};
