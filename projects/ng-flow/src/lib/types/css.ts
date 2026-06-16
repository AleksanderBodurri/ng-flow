/**
 * A loose CSS style object, the Angular-port equivalent of React's `CSSProperties`.
 * Applied to elements via Angular's `[style]` binding (which accepts this shape).
 */
export type CSSProperties = Record<string, string | number | null | undefined>;
