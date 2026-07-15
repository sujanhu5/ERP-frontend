import{c as i,j as e,S as l,Q as o}from"./index-DwYflfz1.js";/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=i("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=i("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=i("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=i("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);function y({page:t,totalPages:s,onPageChange:r}){return s<=1?null:e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 border-t border-line bg-surface-2",children:[e.jsxs("span",{className:"text-xs text-ink-muted",children:["Page ",t," of ",s]}),e.jsxs("div",{className:"flex gap-1.5",children:[e.jsx("button",{className:"btn-secondary !px-2 !py-1",disabled:t<=1,onClick:()=>r(t-1),children:e.jsx(d,{size:15})}),e.jsx("button",{className:"btn-secondary !px-2 !py-1",disabled:t>=s,onClick:()=>r(t+1),children:e.jsx(x,{size:15})})]})]})}function f({rows:t=6,cols:s=5}){return Array.from({length:t}).map((r,n)=>e.jsx("tr",{children:Array.from({length:s}).map((a,c)=>e.jsx("td",{children:e.jsx(l,{className:`h-3.5 ${c===0?"w-40":"w-16"}`})},c))},n))}function b({colSpan:t,icon:s,title:r,message:n,action:a}){return e.jsx("tr",{className:"hover:!bg-transparent",children:e.jsx("td",{colSpan:t,className:"!border-b-0 hover:!bg-transparent",children:e.jsxs("div",{className:"flex flex-col items-center justify-center text-center py-14 px-6",children:[s&&e.jsx("div",{className:"h-11 w-11 rounded-lg bg-surface-2 border border-line flex items-center justify-center mb-3.5",children:e.jsx(s,{size:20,className:"text-ink-subtle"})}),e.jsx("p",{className:"text-sm font-medium text-ink",children:r}),n&&e.jsx("p",{className:"text-xs text-ink-subtle mt-1 max-w-xs",children:n}),a&&e.jsx("div",{className:"mt-4",children:a})]})})})}function j({type:t="edit",onClick:s,title:r}){const n={view:{Icon:o,cls:"hover:text-primary hover:bg-primary-soft"},edit:{Icon:h,cls:"hover:text-primary hover:bg-primary-soft"},delete:{Icon:m,cls:"hover:text-danger hover:bg-danger-soft"}},{Icon:a,cls:c}=n[t];return e.jsx("button",{onClick:s,title:r||t,className:`h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle transition-colors ${c}`,children:e.jsx(a,{size:14})})}export{y as P,j as R,f as T,b as a,m as b,h as c};
