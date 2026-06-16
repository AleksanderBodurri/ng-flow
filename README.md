# ng-flow

A highly customizable **Angular** library for building node-based editors and interactive flow charts — nodes, edges, handles, pan & zoom, minimap, controls, background, selection, and more. Built the modern Angular way: standalone components, zoneless change detection, signals, `input()`/`output()`, new control flow (`@if`/`@for`), and `inject()`.

## Origin

This library is an Angular port of [React Flow (`@xyflow/react`)](https://github.com/xyflow/xyflow), part of the [xyflow](https://github.com/xyflow/xyflow) project by webkid GmbH. Like React Flow and Svelte Flow, `ng-flow` is a thin binding layer over the framework-agnostic [`@xyflow/system`](https://github.com/xyflow/xyflow/tree/main/packages/system) core, which it reuses directly — so edge-path math, pan/zoom, dragging, and handle/connection logic are byte-for-byte identical to React Flow.

## Built with reangular

This library was generated using the [reangular](https://github.com/aleksanderbodurri/reangular) skill — an automated React-to-Angular conversion harness for coding agents.

## Install

```bash
npm install @aleksanderbodurri/ng-flow @xyflow/system classcat zustand @angular/cdk
```

Import the theme once (e.g. in your global `styles.scss`):

```scss
@use '@aleksanderbodurri/ng-flow/styles/style.scss'; /* or the structural-only base.scss */
```

## Quick start

```ts
import { Component, signal } from '@angular/core';
import {
  NgFlow, Background, BackgroundVariant, Controls, MiniMap,
  type Node, type Edge, type NodeChange, applyNodeChanges,
} from '@aleksanderbodurri/ng-flow';

@Component({
  selector: 'app-flow',
  imports: [NgFlow, Background, Controls, MiniMap],
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges"
      [onNodesChange]="onNodesChange"
      [fitView]="true"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-controls />
      <ng-flow-minimap />
    </ng-flow>
  `,
  styles: `:host { display: block; height: 100vh; }`,
})
export class FlowComponent {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly nodes = signal<Node[]>([
    { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
    { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  ]);
  protected readonly edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
  protected readonly onNodesChange = (changes: NodeChange[]) =>
    this.nodes.update((ns) => applyNodeChanges(changes, ns));
}
```

### Key differences from React Flow

- **Components instead of JSX:** `<ng-flow>` (≈ `<ReactFlow>`), `<ng-flow-background>`, `<ng-flow-controls>`, `<ng-flow-minimap>`, `<ng-flow-panel>`, `<ng-flow-handle>`, `<ng-flow-node-toolbar>`, `<ng-flow-edge-toolbar>`, `<ng-flow-node-resizer>`, `<ng-flow-provider>` (≈ `<ReactFlowProvider>`).
- **Events are callback inputs** named exactly as React Flow (`[onConnect]`, `[onNodesChange]`, `[onNodeClick]`, `[onInit]`, …) so existing React Flow code migrates directly.
- **Hooks return Signals.** `useReactFlow()`, `useNodes()`, `useViewport()`, `useNodesState()`, etc. are called in an injection context (inside a component under `<ng-flow>`/`<ng-flow-provider>`).
- **Custom node/edge types** are Angular component classes registered via `[nodeTypes]`/`[edgeTypes]` and rendered with the right dynamic-component mechanism (HTML for nodes, SVG-namespaced for edges).

## Demo

A demo app exercising every feature (65 routes mirroring the React Flow examples) lives in `projects/demo`:

```bash
npm install
npm run start   # ng serve demo → http://localhost:4200
```

## Original contributors

Contributors to [React Flow / xyflow](https://github.com/xyflow/xyflow), sorted by commit count (extracted via `git -C xyflow shortlog -sn --no-merges HEAD`; automated bot accounts omitted):

1. moklick (2527 commits)
2. peterkogo (578 commits)
3. Christopher Möller (142 commits)
4. Moritz Klack (96 commits)
5. Peter (93 commits)
6. Christopher Möller (52 commits)
7. Dimitri POSTOLOV (50 commits)
8. Abbey Yacoe (47 commits)
9. Alessandro (40 commits)
10. braks (40 commits)
11. Moritz (37 commits)
12. Jack Fishwick (35 commits)
13. Ze-Zheng Wu (15 commits)
14. Eugene Samonenko (12 commits)
15. Hayleigh Thompson (9 commits)
16. AndyLnd (8 commits)
17. Artyom Sovetnikov (8 commits)
18. Ivan Akulov (8 commits)
19. Nate Amack (8 commits)
20. Yaroslav Halchenko (8 commits)
21. Solomon Astley (7 commits)
22. printer_scanner (7 commits)
23. Alessandro Cheli (6 commits)
24. Alireza Sheikholmolouki (6 commits)
25. Clément Loridan (6 commits)
26. Furkan Kalaycioglu (6 commits)
27. GeoffreyLiu (6 commits)
28. Peter Kogo (6 commits)
29. Robin Goupil (6 commits)
30. Sebastián Alvarez (6 commits)
31. RunDevelopment (5 commits)
32. Himself65 (4 commits)
33. Joey Ballentine (4 commits)
34. Karlo Bistrički (4 commits)
35. ShaMan123 (4 commits)
36. Wenchen Li (4 commits)
37. fdnklg (4 commits)
38. jasonpul (4 commits)
39. Alaric Baraou (3 commits)
40. Andreas Schultz (3 commits)
41. Andy (3 commits)
42. Coen (3 commits)
43. Daniel Darabos (3 commits)
44. Matt Huggins (3 commits)
45. Rhys Lloyd (3 commits)
46. chang_su (3 commits)
47. Alexey Volkov (2 commits)
48. CRIMX (2 commits)
49. Christopher Hiester (2 commits)
50. David Lounsbrough (2 commits)
51. DiamondDrake (2 commits)
52. GHOST (2 commits)
53. Jakub Majorek (2 commits)
54. Jeffrey Gordon (2 commits)
55. John Robb (2 commits)
56. Kenny Williams (2 commits)
57. Long Nguyen (2 commits)
58. Mahdi Esbati (2 commits)
59. Noam Neeman (2 commits)
60. Orlando (2 commits)
61. Paula Stachova (2 commits)
62. Przemysław Żydek (2 commits)
63. Shlomo Galle (2 commits)
64. Spencer Whitehead (2 commits)
65. Veniamin Krol (2 commits)
66. andreyworkspace (2 commits)
67. artemtam (2 commits)
68. ysds (2 commits)
69. 4t145 (1 commits)
70. = (1 commits)
71. Abinadi Cordova (1 commits)
72. Adam Krebs (1 commits)
73. Aidan Barrett (1 commits)
74. Akihiro Kiuchi (1 commits)
75. Alex Dawes (1 commits)
76. Amir Ali (1 commits)
77. Amr-Shams (1 commits)
78. Ashwanth Kumar (1 commits)
79. Ben Chidlow (1 commits)
80. Bjørn Olav Salvesen (1 commits)
81. Braks (1 commits)
82. Campbell Wass (1 commits)
83. Christian Lagerkvist (1 commits)
84. Connie (1 commits)
85. Damian Stasik (1 commits)
86. Daniel Leal (1 commits)
87. Daniel Sanchez (1 commits)
88. DenizUgur (1 commits)
89. Dylan Middendorf (1 commits)
90. Edson Miguel Dewes (1 commits)
91. Emiel Wit (1 commits)
92. Eric (1 commits)
93. Fabian Bieler (1 commits)
94. Fawad Shaikh (1 commits)
95. Felipe Emos (1 commits)
96. Ikko Eltociear Ashimine (1 commits)
97. Ilia (1 commits)
98. Ilya Moroz (1 commits)
99. Ivan S (1 commits)
100. Jaan (1 commits)
101. Jakob Hofer (1 commits)
102. James Moynihan (1 commits)
103. Jeff Jenner (1 commits)
104. Jeremiasz Major (1 commits)
105. John Weis (1 commits)
106. Luis Carlos (1 commits)
107. Mahdi (1 commits)
108. Marc Vila (1 commits)
109. Michael Schmidt (1 commits)
110. Michael Spiss (1 commits)
111. Michael Theobald (1 commits)
112. Michal Srb (1 commits)
113. Miri Dagan (1 commits)
114. Mustafa Kemal Tuna (1 commits)
115. Nick Lawrence (1 commits)
116. Niels Kaspers (1 commits)
117. Philipp Garbowsky (1 commits)
118. RedPhoenixQ (1 commits)
119. Rein van Haaren (1 commits)
120. Richard Schulz (1 commits)
121. Ryan Kois (1 commits)
122. Ryan Welch (1 commits)
123. Sahil Mane (1 commits)
124. Samuel Degueldre (1 commits)
125. Serhii Holinei (1 commits)
126. Stephan Eggermont (1 commits)
127. Stojan Stamkov (1 commits)
128. Svilen Ivanov (1 commits)
129. Tiago Costa (1 commits)
130. Tony Francis (1 commits)
131. Tornado Softwares (1 commits)
132. Totoro-moroku (1 commits)
133. Tristan Brewster (1 commits)
134. Tzu-Yu Lee (1 commits)
135. Vincent Driessen (1 commits)
136. Ward Oosterlijnck (1 commits)
137. Wayne Tee (1 commits)
138. clifford (1 commits)
139. datoslabs (1 commits)
140. dfblhmm (1 commits)
141. doctoroyy (1 commits)
142. dongqiang.02 (1 commits)
143. fezproof (1 commits)
144. filippo-one (1 commits)
145. himself65 (1 commits)
146. hiyangguo (1 commits)
147. justn-hyeok (1 commits)
148. moretall (1 commits)
149. pengfu (1 commits)
150. saswata (1 commits)
151. spky (1 commits)
152. stffabi (1 commits)
153. timhwang21 (1 commits)
154. timo (1 commits)
155. zhbhun (1 commits)
156. Émilien Leroux (1 commits)
157. Ítalo Andrade (1 commits)
158. Анна Кузнецова (1 commits)
159. 栗嘉男 (1 commits)

## License

MIT — same as the upstream [xyflow](https://github.com/xyflow/xyflow) project.
