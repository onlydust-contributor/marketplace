import classNames from "classnames";
import { PropsWithChildren } from "react";
import Tip from "./Tip";

export enum TooltipDirection {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

type Props = {
  direction?: TooltipDirection;
} & PropsWithChildren;

export default function Tooltip({ children, direction = TooltipDirection.Up }: Props) {
  return (
    <div
      className={classNames("flex items-center justify-items-center w-fit h-fit", {
        "flex-col": direction === TooltipDirection.Up,
        "flex-col-reverse": direction === TooltipDirection.Down,
        "flex-row-reverse": direction === TooltipDirection.Right,
        "flex-row": direction === TooltipDirection.Left,
      })}
    >
      <Tip direction={direction} />
      <div className="bg-white/8 backdrop-blur-lg font-normal font-walsheim text-center text-xs text-greyscale-50 rounded-lg py-2 px-3">
        {children}
      </div>
    </div>
  );
}
