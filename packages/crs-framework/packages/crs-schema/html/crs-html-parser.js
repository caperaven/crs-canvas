class t{constructor(t){this.parser=t,this.isManager=!0}async dispose(){await this.reset(),delete this.parser}async assert(t,e,s){const a=1==t();return a&&e.push(s),!a}async validate(t,e){if(null!=t.elements)for(let s of t.elements)await this.parser.validateItem(s,e)}async reset(){}}class e extends t{get key(){return"templates"}async reset(){for(let t of this._parts||[])null!=this[t]&&(this[t].clear(),this[t]=null)}async initialize(){this._parts=[],await this._load("templates")}async _load(t){null==this[t]&&(this[t]=new Map,this._parts.push(t));const e=this.parser.schema[t];for(let s of e)null==s.import?this[t].set(s.id,s):await this._load(s.import)}async getTemplate(t,e){if(0==this[t].has(e))throw new Error(`There is no template in the schema for with id "${e}"`);return this[t].get(e)}async validate(t,e){if(await this.assert((()=>0==Array.isArray(t)),e,"templates definition must be a array")){await this.initialize(t);for(const t of this.templates)await this.assert((()=>null==t.id),e,"template must have a valid id property"),await this.assert((()=>null==t.elements),e,"template must have a elements property"),await this.assert((()=>1!=Array.isArray(t.elements)),e,"template elements property should be an array"),await this.assert((()=>0==(t.elements||[]).length),e,"template elements must contain content")&&await super.validate(t,e)}}}class s extends t{get key(){return"variables"}get valueProcessor(){return!0}async reset(){delete this.variables}async initialize(t){this.variables=t}async process(t){return this.getValue(t)}async getValue(t){return"string"!=typeof t||"@"!=t.trim()[0]?t:async function(t,e){let s=t;if(-1==e.indexOf("."))return s[e];const a=e.split(".");for(let t=0;t<a.length-1;t++)if(s=s[a[t]],null==s)return null;return s[a[a.length-1]]}(this.variables,t.slice(1))}}class a{constructor(t){this.parser=t}async dispose(){delete this.parser}async shouldParse(t){return!0}async process(t){null!=this.styles&&(t.styles=[]);return{children:await this.parser.parseChildren(t),attributes:await this.parser.parseAttributes(t),styles:await this.parser.parseStyles(t),content:await this.parser.parseContent(t)}}async setValues(t,e){const s=Object.keys(e);for(let a of s){const s=null!=e[a]?e[a]:"";t=t.split(a).join(s)}return t}async validate(t,e){if(null!=t.elements)for(let s of t.elements)await this.parser.validateItem(s,e)}async assert(t,e,s){const a=1==await t();return a&&e.push(s),!a}}class r extends a{get key(){return"body"}get template(){return"__content__"}async process(t){const e=await super.process(t);return await this.setValues(this.template,{__content__:e.children})}async validate(t,e){await this.assert((()=>Array.isArray(t)),e,"Body element must be a object not an array"),await this.assert((()=>null==t.elements),e,"elements property required on body"),await this.assert((()=>0==Array.isArray(t.elements)),e,"element property on body must be an array"),await super.validate(t,e)}}class i extends a{get key(){return"raw"}get template(){return"<__element__ __attributes__ __styles__>__content__</__element__>"}async process(t,e){const s=await super.process(t);return await this.setValues(this.template,{__element__:e,__attributes__:s.attributes,__styles__:s.styles,__content__:s.children||s.content||""})}async validate(t,e){await super.validate(t,e)}}class n extends a{get key(){return"template"}get template(){return"<div __attributes__ __classes__ >\n                    __content__\n                </div>"}async process(t,e){const s=this.parser.managers.get("templates");if(null==s)throw new Error("templates manager should be registered");let a=Object.getOwnPropertyNames(t).find((t=>-1!==t.toLowerCase().indexOf("template")));const r=t[a];"template"==a&&(a="templates");const i=await s.getTemplate(a,r);t.elements=i.elements;const n=await super.process(t);return await this.setValues(this.template,{__attributes__:n.attributes,__classes__:n.styles,__content__:n.children})}async processTemplate(t){return(await super.process(t)).children}async validate(t,e){await this.assert((()=>null==t.template),e,"template element must have a valid template property")}}const o='<svg xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#__icon__"/></svg>';class l extends a{get key(){return"button"}get template(){return"<button __attributes__ __styles__>__content__</button>"}async process(t,e){const s=await super.process(t),a=await this.parser.parseStringValue(t.caption),r=null==t.icon?"":o.split("__icon__").join(t.icon),i=null==t.icon?`<span>${a}</span>`:`${r}<span>${a}</span>`;return await this.setValues(this.template,{__attributes__:s.attributes,__styles__:s.styles,__content__:i})}validate(t,e){this.assert((()=>null==t.caption),e,"button must have a caption")}}class h extends class extends class{constructor(t){this.attributes=t,this.styleImports=[],this.providers=new Map,this.managers=new Map,this.valueProcessors=[]}async dispose(){for(let t of this.providers.keys())await this.providers.get(t).dispose();for(let t of this.managers.keys())await this.managers.get(t).dispose();await this.providers.clear(),await this.managers.clear(),delete this.providers,delete this.managers,delete this.attributes,this.valueProcessors.length=0,this.options=0}async register(t){const e=new t(this);1==e.isManager?(this.managers.set(e.key,e),1==e.valueProcessor&&this.valueProcessors.push(e)):this.providers.set(e.key,e)}async load(t){for(let e of t||[])await this.register((await import(e)).default)}async init(){for(const t of this.managers)t.reset&&await t.reset();const t=Object.keys(this.schema);for(let e of t)e!=this.options.root&&this.managers.has(e)&&await this.managers.get(e).initialize(this.schema[e])}async processStyleImports(t){if(this.styleImports.length>0){const e=[];this.styleImports.forEach((t=>e.push(`@import "${t}";`))),t=`<style>${e.join("\n")};</style>${t}`}return t}async validate(){}}{constructor(t){super(t),this.styleImports=[],this.options={elementKey:"element",childrenKey:"elements",attributesKey:"attributes",stylesKey:"styles",root:"body",contentKey:"content"}}async dispose(){await super.dispose(),this.styleImports.length=0,this.options=null}async initialize(){await this.register(e),await this.register(s),await this.register(r),await this.register(i),await this.register(n),await this.register(l)}async parseItem(t,e){if(null!=t)if(e=e||t[this.options.elementKey],this.providers.has(e)){const s=this.providers.get(e);if(!1!==await s.shouldParse(t))return s.process(t)}else{const s=this.providers.get("raw");if(!1!==s.shouldParse(t))return s.process(t,e)}}async parseAttributes(t){const e=t[this.options.attributesKey];if(null==e)return null;const s=[];for(const t of Object.entries(e)){const e=t[0];let a=t[1];a=await this.parseStringValue(a,e),s.push(`${e}="${a}"`)}return s.join(" ")}async parseStyles(t){let e=t[this.options.stylesKey];return null==e?null:(Array.isArray(e)&&(e=e.join(" ")),`class="${e}"`)}async parseChildren(t){const e=t[this.options.childrenKey];if(null==e)return null;const s=[];for(let t of e)s.push(await this.parseItem(t));return s.join("")}async parseContent(t){let e=t[this.options.contentKey];return null==e?null:this.parseStringValue(e)}async parseStringValue(t,e){for(let s of this.valueProcessors)t=await s.process(t,e);return t}}{async addStyleImports(t){Array.isArray(t)?t.forEach((t=>this.styleImports.push(t))):this.styleImports.push(t)}async parse(t){if(this.schema=t,await this.init(),0==this.providers.has(this.options.root))throw new Error(`schema requires a "${this.options.root}" option`);const e=t[this.options.root];if(null==e)throw new Error(`schema should have a property "${this.options.root}"`);let s=await this.providers.get(this.options.root).process(e);s=await this.processStyleImports(s);for(const t of this.managers.keys()){const e=this.managers.get(t);await e.reset()}return delete this.schema,s}async validate(t,e){const s=this.providers.get(this.options.root);null==s&&e.push("a root provider was not registered");const a=Object.keys(t);for(let s of a)if(s!=this.options.root&&this.managers.has(s)){const a=this.managers.get(s);null!=a.validate&&a.validate(t[s],e)}const r=t[this.options.root];s&&s.validate(r,e)}async validateItem(t,e){const s=t.element;let a=this.providers.get(s);null==a&&(a=this.providers.get("raw")),a.validate&&a.validate(t,e)}}"undefined"!=typeof self&&(self.crs=self.crs||{},self.crs.HTMLParser=h);export{h as HTMLParser};
