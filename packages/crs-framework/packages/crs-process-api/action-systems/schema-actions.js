class u{#s={};#a={};constructor(){this.#s={}}async register(a,s,r,e){const t=await crs.createSchemaLoader(new s(e));for(const c of r)t.register((await import(c)).default);return this.#s[a]=t,this.#a[a]=[],t}async unregister(a){this.#s[a]?.dispose(),this.#a[a]=null,delete this.#s[a]}async parse(a,s,r){return new Promise(async e=>{const t=async()=>{typeof s=="string"&&(s=await fetch(s).then(i=>i.json()));const c=await this.#s[a].parse(s,r);e(c)};this.#e(a,t)})}#e(a,s){this.#a[a].push(s),this.#a[a].length===1&&this.#r(a)}#r(a){this.#a[a].length<1||this.#a[a][0]().then(()=>this.#a[a].shift()).then(this.#r.bind(this,a))}}class o{static async perform(a,s,r,e){await this[a.action]?.(a,s,r,e)}static async register(a,s,r,e){const t=await crs.process.getValue(a.args.id,s,r,e),c=await crs.process.getValue(a.args.parser,s,r,e),i=await crs.process.getValue(a.args.providers,s,r,e),h=await crs.process.getValue(a.args.parameters,s,r,e),n=await crs.schemaParserManager.register(t,c,i,h);return a.args.target!=null&&await crs.process.setValue(a.args.target,n,s,r,e),n}static async unregister(a,s,r,e){const t=await crs.process.getValue(a.args.id,s,r,e);await crs.schemaParserManager.unregister(t)}static async parse(a,s,r,e){const t=await crs.process.getValue(a.args.id,s,r,e),c=await crs.process.getValue(a.args.schema,s,r,e),i=await crs.schemaParserManager.parse(t,c,s);return a.args.target!=null&&await crs.process.setValue(a.args.target,i,s,r,e),i}}globalThis.crs||={},crs.schemaParserManager=new u,crs.intent.schema=o;export{o as SchemaActions};
