class h{static async perform(e,t,s,a){await this[e.action](e,t,s,a)}static async init(e,t,s,a){const n=await crs.dom.get_element(e.args.element);n.style.display="grid"}static async auto_fill(e,t,s,a){const n=await crs.dom.get_element(e.args.element),l=await crs.process.getValue(e.args.columns,t,s,a),i=await crs.process.getValue(e.args.rows,t,s,a);await this.init(e,t,s,a),await this.set_columns(e,t,s,a),await this.set_rows(e,t,s,a);const o=l.split(" ").length,m=i.split(" ").length*o;for(let g=0;g<m;g++)await crs.call("dom","create_element",{parent:n,tag_name:"div",dataset:{id:g},styles:{border:"1px solid silver"},classes:["grid-cell"]})}static async set_columns(e,t,s,a){const n=await crs.dom.get_element(e.args.element),l=await crs.process.getValue(e.args.columns,t,s,a);n.style.gridTemplateColumns=l}static async set_rows(e,t,s,a){const n=await crs.dom.get_element(e.args.element),l=await crs.process.getValue(e.args.rows,t,s,a);n.style.gridTemplateRows=l}static async add_columns(e,t,s,a){await _(e,t,s,a,"gridTemplateColumns","width")}static async remove_columns(e,t,s,a){await y(e,t,s,a,"gridTemplateColumns")}static async set_column_width(e,t,s,a){await f(e,t,s,a,"gridTemplateColumns","width")}static async add_rows(e,t,s,a){await _(e,t,s,a,"gridTemplateRows","height")}static async remove_rows(e,t,s,a){await y(e,t,s,a,"gridTemplateRows")}static async set_row_height(e,t,s,a){await f(e,t,s,a,"gridTemplateRows","height")}static async set_regions(e,t,s,a){const n=await crs.dom.get_element(e.args.element),l=await crs.process.getValue(e.args.areas,t,s,a),i=await crs.process.getValue(e.args.auto_fill,t,s,a)||!1,o=await C(n);let c=[];for(let g of l)p(o,g),c.push(g.name);let m=[];for(let g of o)m.push(`"${g.join(" ")}"`);if(n.style.gridTemplateAreas=m.join(" "),i==!0){const g=await crs.process.getValue(e.args.tag_name,t,s,a)||"div";for(const u of c)await crs.call("dom","create_element",{parent:n,tag_name:g,dataset:{area:u},styles:{gridArea:u}})}}static async clear_region(e,t,s,a){const n=await crs.dom.get_element(e.args.element),l=await crs.process.getValue(e.args.area,t,s,a),i=n.querySelectorAll(`[data-area="${l}"]`);for(const o of i)o.parentElement.removeChild(o)}static async column_count(e){const t=await crs.dom.get_element(e.args.element);return w(t)}static async row_count(e){const t=await crs.dom.get_element(e.args.element);return d(t)}}function p(r,e){for(let t=e.start.row;t<=e.end.row;t++)for(let s=e.start.col;s<=e.end.col;s++)r[t][s]=e.name}function w(r){return r.style.gridTemplateColumns.split(" ").length}function d(r){return r.style.gridTemplateRows.split(" ").length}async function C(r){const e=w(r),t=d(r);let s=[];for(let a=0;a<t;a++){s[a]=[];for(let n=0;n<e;n++)s[a][n]="."}return s}async function f(r,e,t,s,a,n){const l=await crs.dom.get_element(r.args.element);let i=l.style[a].split(" ");if(i.length==0)return;let o=await crs.process.getValue(r.args[n],e,t,s);const c=await crs.process.getValue(r.args.position,e,t,s);i[c]=o,l.style[a]=i.join(" ")}async function _(r,e,t,s,a,n){const l=await crs.dom.get_element(r.args.element);let i=l.style[a].split(" ");if(i.length==0)return;let o=await crs.process.getValue(r.args[n],e,t,s),c=await crs.process.getValue(r.args.position,e,t,s);c==null&&(c="end"),Array.isArray(o)==!1&&(o=[o]),c=="front"?i=[...o,...i]:c=="end"?i.push(...o):i.splice(c,0,...o),l.style[a]=i.join(" ")}async function y(r,e,t,s,a){const n=await crs.dom.get_element(r.args.element);let l=n.style[a].split(" ");if(l.length==0)return;const i=await crs.process.getValue(r.args.position,e,t,s)||"end",o=await crs.process.getValue(r.args.count,e,t,s)||1;i=="front"?l.splice(0,o):i=="end"?l.splice(l.length-o,o):l.splice(i,o),n.style[a]=l.join(" ")}crs.intent.cssgrid=h;export{h as CssGridActions};