import{EditorView as e,basicSetup as i,markdown as n,json as a,css as h,javascript as l,html as r,autocompletion as o}from"./editor.js";const c=Object.freeze({markdown:n,json:a,javascript:l,css:h,html:r});class u extends HTMLElement{#t;#e;#s;get editor(){return this.#t}get value(){return this.#n()}set value(t){this.#e=t,this.#t!=null&&this.#i(t)}get language(){return this.dataset.language||"markdown"}async connectedCallback(){const t=this.innerHTML.trim();this.innerHTML="",this.#s=e.updateListener.of(s=>{s.docChanged==!0&&this.dispatchEvent(new CustomEvent("change",{detail:this.#n()}))}),this.#t=new e({extensions:[i,c[this.language](),o(),this.#s],parent:this}),this.#e!=null?this.#i(this.#e):t.length>0&&this.#i(t),await crs.call("component","notify_ready",{element:this})}async disconnectedCallback(){this.#t=null,this.#s=null,this.#e=null}#i(t){this.#t.dispatch({changes:{from:0,to:this.#t.state.doc.length,insert:t}})}#n(){return this.#t==null?"":this.#t.state.doc.toString()}}customElements.define("text-editor",u);