class o extends crsbinding.classes.BindableElement{#t=[];get shadowDom(){return!0}get html(){return import.meta.url.replace(".js",".html")}async connectedCallback(){await super.connectedCallback()}async load(){const t=this.shadowRoot.querySelector("#tplFolder"),e=this.shadowRoot.querySelector("#tplFile");await crsbinding.inflationManager.register("file-system-folder",t),await crsbinding.inflationManager.register("file-system-file",e)}async disconnectedCallback(){await crsbinding.inflationManager.unregister("file-system-folder"),await crsbinding.inflationManager.unregister("file-system-file"),await super.disconnectedCallback()}#s(t,e){for(const a of t)a.path=e.length==0?a.name:`${e}/${a.name}`}async#n(t){if(this.dispatchEvent(new CustomEvent("change",{detail:{kind:"directory",name:t.textContent.split(`
`).join("")}})),t.matches('[aria-expanded="true"]'))return await this.#i(t);t.setAttribute("aria-expanded","true");const e=Number(t.dataset.level),a=t.dataset.path,s=this.#t.findIndex(h=>h.path==a),n=this.#t[s],i=await crs.call("fs","open_folder",{handle:n});await this.#r(i,a);const d=await this.#a(i,e+1);t.parentElement.insertBefore(d,t.nextElementSibling),this.#t.splice(s+1,0,...i),t.dataset.count=i.length}async#i(t){t.setAttribute("aria-expanded","false");const e=Number(t.dataset.count);t.dataset.count=0;for(let s=0;s<e;s++)t.parentElement.removeChild(t.nextElementSibling);const a=this.#t.findIndex(s=>s.path==t.dataset.path);this.#t.splice(a+1,e)}async#e(t){const e=t.dataset.path,a=this.#t.find(n=>n.path==e),s=await crs.call("fs","read_file",{handle:a});this.dispatchEvent(new CustomEvent("change",{detail:{kind:"file",name:t.textContent.split(`
`).join(""),content:s,path:t.dataset.path}}))}async#r(t,e){for(const a of t)a.path=`${e}/${a.name}`}async#a(t,e=0){const a=[],s=[];for(const i of t)i.kind=="file"?s.push(i):a.push(i);l(a),l(s);const n=document.createDocumentFragment();return c(a,n,"file-system-folder",e),c(s,n,"file-system-file",e),n}async selectFolder(){this.#t=await crs.call("fs","open_folder",{}),this.#s(this.#t,"");const t=this.shadowRoot.querySelector("ul");t.innerHTML="";const e=await this.#a(this.#t);await t.appendChild(e)}async dblclick(t){const e=t.composedPath()[0];if(e.nodeName=="UL")return;if(e.parentElement.querySelector("[aria-selected]")?.removeAttribute("aria-selected"),e.setAttribute("aria-selected","true"),e.dataset.type==="directory")return await this.#n(e);await this.#e(e)}async click(t){const e=t.composedPath()[0];e.parentElement.querySelector("[aria-selected]")?.removeAttribute("aria-selected"),e.setAttribute("aria-selected","true"),e.dataset.type==="file"&&await this.#e(e)}async save(t,e){const a=this.#t?.find(s=>s.path==t);a!=null&&(await crs.call("fs","save_file",{handle:a,content:e}),await crs.call("toast_notification","show",{message:"successfully saved",severity:"info"}))}async saveNew(t,e){const a=await crs.call("fs","write_new_file",{file_types:e,default_name:"undefined",content:t});return a.path=a.name,this.#t.push(a),a.name}}function l(r){r.sort((t,e)=>t.name<e.name?-1:t.name>e.name?1:0)}function c(r,t,e,a){if(r.length==0)return;const s=crsbinding.inflationManager.get(e,r);for(;s?.firstElementChild;){const n=s.firstElementChild.cloneNode(!0);n.dataset.level=a,n.style.marginLeft=`${a*16}px`,t.appendChild(n),s.removeChild(s.firstElementChild)}}customElements.define("file-system",o);export{o as default};
