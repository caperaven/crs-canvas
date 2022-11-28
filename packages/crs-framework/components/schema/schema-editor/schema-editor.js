import"./../../text-editor/text-editor.js";import"./../../schema/schema-viewer/schema-viewer.js";const i=`{
  "variables": {
    "translations": {
      "button": "My Button"
    }
  },
  "body": {
    "elements": [
      {
        "element": "button",
        "caption": "@translations.button"
      }
    ]
  }
}
`;class a extends HTMLElement{#t;#s=this.#i.bind(this);#e;get parser(){return this.dataset.parser||"html"}get editor(){return this.#t==null&&(this.#t=this.querySelector("text-editor")),this.#t}async connectedCallback(){this.innerHTML=await fetch(import.meta.url.replace(".js",".html")).then(t=>t.text()),requestAnimationFrame(async()=>{this.editor.value=i,await this.update(),this.editor.addEventListener("change",this.#s),await crs.call("cssgrid","enable_resize",{element:this,options:{columns:[0]}})})}async disconnectedCallback(){this.editor.removeEventListener("change",this.#s),this.#s=null,await crs.call("cssgrid","disable_resize",{element:this}),this.#t=null,this.#e=null}async#i(t){if(this.#e!=!0){this.#e=!0;const e=setTimeout(()=>{clearTimeout(e),this.update(),this.#e=!1},32)}}async update(){const t=this.querySelector("schema-viewer");try{const e=this.editor.value,s=JSON.parse(e);await t.set_schema(this.parser,s)}catch{return}}}customElements.define("schema-editor",a);export{a as SchemaEditor};
