import { INK } from "../../tokens";

/**
 * The plug and the socket of the WebMCP agent, as in the landing page. Each is drawn around the hand holding it, at
 * (0 0), facing the other one along +x (plug) or -x (socket) before the animation's rotation; they mate when the
 * hands are 18 apart (the plug's prongs go into the socket's holes). The prongs and the holes are separate props so
 * they can be hidden while the two are plugged together.
 */

const PRONG = "#B8BCC6";

/** The plug's white body, 2.5 to 8.5 in front of the hand. */
export function Plug() {
  return <rect x={2.5} y={-2.6} width={6} height={5.2} rx={1.1} fill="#FFFFFF" stroke={INK} strokeLinejoin="round" strokeWidth={1.4} />;
}

/** The plug's two metal prongs, sticking out of its front (drawn under the body, as in the original). */
export function PlugProngs() {
  return (
    <g fill={PRONG} stroke={INK} strokeWidth={0.8}>
      <rect x={8.1} y={-1.9} width={3.4} height={1.15} rx={0.4} />
      <rect x={8.1} y={0.75} width={3.4} height={1.15} rx={0.4} />
    </g>
  );
}

/** The socket's white body, 2.5 to 9.5 in front of the hand (towards -x). */
export function Socket() {
  return <rect x={-9.5} y={-3} width={7} height={6} rx={1.3} fill="#FFFFFF" stroke={INK} strokeLinejoin="round" strokeWidth={1.4} />;
}

/** The socket's two holes, on its face. */
export function SocketHoles() {
  return (
    <g fill={INK}>
      <rect x={-9.1} y={-1.9} width={1.5} height={1.15} rx={0.3} />
      <rect x={-9.1} y={0.75} width={1.5} height={1.15} rx={0.3} />
    </g>
  );
}
