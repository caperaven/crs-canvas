class t extends crsbinding.classes.BindableElement{#e;get shadowDom(){return!0}get html(){return import.meta.url.replace(".js",".html")}async connectedCallback(){super.connectedCallback();const e=this.getAttribute("for");this.#e=this.parentElement.querySelector(e)}async disconnectedCallback(){this.#e=null,await super.disconnectedCallback()}async filter(e){if(e.code=="ArrowDown")return this.dispatchEvent(new CustomEvent("focus-out"));await crs.call("dom_collection","filter_children",{filter:e.target.value.toLowerCase(),element:this.#e})}async close(){this.dispatchEvent(new CustomEvent("close"))}}customElements.define("filter-header",t);