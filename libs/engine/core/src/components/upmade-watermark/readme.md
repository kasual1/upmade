# upmade-watermark



<!-- Auto Generated Below -->


## Overview

Watermark shown in the bottom-right corner of the engine: the Upmade logo (the pink agent) and "upmade.io".

Now and then the agent glances around, blinks or hops, and it notices the pointer coming onto the badge; with
reduced motion it stands still. Rendered inside the engine's Shadow DOM unless the engine's `isWatermarkVisible`
prop is set to false. The badge links to the Upmade website, and screen readers announce it as "Powered by Upmade" in the
active locale.

## Properties

| Property            | Attribute | Description                                                                                                                                                                                                                     | Type         | Default     |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| `core` _(required)_ | --        | The core instance used to resolve localized terms.                                                                                                                                                                              | `UpmadeCore` | `undefined` |
| `label`             | `label`   | Resolved "Powered by Upmade" label, the badge's accessible name (no tooltip). Passed in by the engine so the badge re-renders when the active locale changes. Falls back to resolving the term from the core when not provided. | `string`     | `undefined` |


## Shadow Parts

| Part               | Description                                       |
| ------------------ | ------------------------------------------------- |
| `"watermark"`      | The badge (a link to the Upmade website)          |
| `"watermark-logo"` | The Upmade logo (the pink agent) inside the badge |


## Dependencies

### Used by

 - [upmade-engine](../upmade-engine)

### Graph
```mermaid
graph TD;
  upmade-engine --> upmade-watermark
  style upmade-watermark fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
