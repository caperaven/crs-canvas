class n extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}async connectedCallback(){this.shadowRoot.innerHTML=await fetch(import.meta.url.replace(".js",".html")).then(t=>t.text())}async set_markdown(t,e=null){const a=await crs.call("markdown","to_html",{markdown:t,parameters:e});this.shadowRoot.querySelector("article").innerHTML=a,t.indexOf("&{")!=-1&&await crsbinding.translations.parseElement(this)}}customElements.define("markdown-viewer",n);