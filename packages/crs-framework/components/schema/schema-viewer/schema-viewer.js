class a extends HTMLElement{async set_schema(e,s){this.innerHTML=await crs.call("schema","parse",{id:e,schema:s})}}customElements.define("schema-viewer",a);
