import"./actions/editing-actions.js";import{addColumnFeatures as r}from"./columns.js";import{addSelectionFeature as s}from"./selection.js";import{selectedConverter as i}from"./value-converters/selected-converter.js";import{enableInput as l,disableInput as c}from"./input.js";class n extends crsbinding.classes.BindableElement{#e;#t;get columns(){return this.#e}get columnGroups(){return this.#t}get selectionType(){return this.dataset.selection||"none"}get html(){return import.meta.url.replace(".js",".html")}async connectedCallback(){await super.connectedCallback(),crsbinding.valueConvertersManager.add("selected",i),this.#e=[],this.#t=[],await r(this),await s(this),await l(this)}async disconnectedCallback(){crsbinding.valueConvertersManager.remove("selected"),this.#e=null,this.#t=null,await c(this),await super.disconnectedCallback()}async rowExecute(e){if(e.ctrlKey==!0)return await crs.call("grid_editing","edit",{element:e.target});e.preventDefault(),this.dispatchEvent(new CustomEvent("row-execute",e.target))}async addColumnElements(e){dispatchEvent(new CustomEvent("columns-added",{detail:this}))}async modifyRecord(e,o,a,t){t!=null&&(a=await crsbinding.valueConvertersManager.convert(a,t.converter,"set",t.parameter))}}customElements.define("data-grid",n);export{n as default};