import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";

/*
 * Szenenübergänge als Kamerabewegung statt als harter Schnitt:
 * - push: die Kamera fährt durch das alte Bild hindurch ins neue
 * - pull: die Kamera zieht aus dem alten Bild heraus
 * - pan:  die Kamera schwenkt seitlich oder vertikal weiter
 * - dip:  kurzes Abblenden ins Schwarz (für Zäsuren)
 */

type Props = { readonly kind: "push" | "pull" | "dip" } | { readonly kind: "pan"; readonly dx: number; readonly dy: number };
type P = Props & Record<string, unknown>;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CameraPresentation: React.FC<TransitionPresentationComponentProps<P>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const entering = presentationDirection === "entering";
  let style: React.CSSProperties = {};

  if (passedProps.kind === "push" || passedProps.kind === "pull") {
    const dir = passedProps.kind === "push" ? 1 : -1;
    style = entering
      ? {
          scale: String(interpolate(p, [0, 1], [dir > 0 ? 0.7 : 1.45, 1])),
          opacity: interpolate(p, [0.1, 0.75], [0, 1], clamp),
        }
      : {
          scale: String(interpolate(p, [0, 1], [1, dir > 0 ? 1.8 : 0.62])),
          opacity: interpolate(p, [0.25, 0.9], [1, 0], clamp),
        };
  } else if (passedProps.kind === "pan") {
    const { dx, dy } = passedProps as { dx: number; dy: number };
    const offset = entering ? 1 - p : -p;
    style = {
      translate: `${offset * dx * 1920}px ${offset * dy * 1080}px`,
      opacity: entering ? interpolate(p, [0, 0.35], [0.4, 1], clamp) : interpolate(p, [0.65, 1], [1, 0.4], clamp),
    };
  } else {
    style = entering
      ? { opacity: interpolate(p, [0.5, 1], [0, 1], clamp) }
      : { opacity: interpolate(p, [0, 0.5], [1, 0], clamp) };
  }

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

const make = (props: Props): TransitionPresentation<P> => ({
  component: CameraPresentation,
  props: props as P,
});

export const push = () => make({ kind: "push" });
export const pull = () => make({ kind: "pull" });
export const dip = () => make({ kind: "dip" });
export const pan = (dx: number, dy = 0) => make({ kind: "pan", dx, dy });
