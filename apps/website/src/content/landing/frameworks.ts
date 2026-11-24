/**
 * The code typer's snippets: the smallest editor setup in each framework, as in its quick start, with the
 * framework's logo and brand colour (Landing/Sections.tsx CODE_FRAMEWORKS, unchanged). The colours live here as data
 * so the CSS modules hold no hex values.
 */
import type { CodeFramework } from "../../components/LandingPage/media/manifest";

export const CODE_FRAMEWORKS = [
  {
    id: "react",
    name: "React",
    logo: "/img/logo-react.svg",
    color: "#4a7dff",
    file: "Editor.tsx",
    code: `import { UpmadeEditor } from '@upmade/react-editor';

export function Editor() {
  return <UpmadeEditor />;
}`,
  },
  {
    id: "vue",
    name: "Vue",
    logo: "/img/logo_vue.svg",
    color: "#42b883",
    file: "Editor.vue",
    code: `<script setup lang="ts">
import { UpmadeEditor } from '@upmade/vue-editor';
</script>

<template>
  <UpmadeEditor />
</template>`,
  },
  {
    id: "angular",
    name: "Angular",
    logo: "/img/logo_angular.svg",
    color: "#dd0031",
    file: "editor.component.ts",
    code: `import { Component } from '@angular/core';
import { UpmadeEditor } from '@upmade/angular-editor';

@Component({
  selector: 'app-editor',
  imports: [UpmadeEditor],
  template: \`<upmade-editor />\`,
})
export class EditorComponent {}`,
  },
] as const satisfies readonly CodeFramework[];
