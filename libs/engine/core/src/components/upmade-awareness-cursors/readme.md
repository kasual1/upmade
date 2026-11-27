# upmade-awareness-cursors



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description                                                                        | Type                        | Default     |
| ---------------------- | ------------------------ | ---------------------------------------------------------------------------------- | --------------------------- | ----------- |
| `core` _(required)_    | --                       |                                                                                    | `UpmadeCore`                | `undefined` |
| `edgeIndicatorPadding` | `edge-indicator-padding` |                                                                                    | `number`                    | `8`         |
| `labelActions`         | --                       | Buttons after the name or status on collaborators' cursor labels. None by default. | `UpmadeCursorLabelAction[]` | `undefined` |
| `showEdgeIndicators`   | `show-edge-indicators`   |                                                                                    | `boolean`                   | `true`      |


## Dependencies

### Used by

 - [upmade-engine](../upmade-engine)

### Depends on

- [upmade-icon](../upmade-icon)

### Graph
```mermaid
graph TD;
  upmade-awareness-cursors --> upmade-icon
  upmade-engine --> upmade-awareness-cursors
  style upmade-awareness-cursors fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
