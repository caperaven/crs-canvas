class s{constructor(s){this.attributes=s,this.styleImports=[],this.providers=new Map,this.managers=new Map,this.valueProcessors=[]}async dispose(){for(let s of this.providers.keys())await this.providers.get(s).dispose();for(let s of this.managers.keys())await this.managers.get(s).dispose();await this.providers.clear(),await this.managers.clear(),delete this.providers,delete this.managers,delete this.attributes,this.valueProcessors.length=0,this.options=0}async register(s){const t=new s(this);1==t.isManager?(this.managers.set(t.key,t),1==t.valueProcessor&&this.valueProcessors.push(t)):this.providers.set(t.key,t)}async load(s){for(let t of s||[])await this.register((await import(t)).default)}async init(){for(const s of this.managers)s.reset&&await s.reset();const s=Object.keys(this.schema);for(let t of s)t!=this.options.root&&this.managers.has(t)&&await this.managers.get(t).initialize(this.schema[t])}async processStyleImports(s){if(this.styleImports.length>0){const t=[];this.styleImports.forEach((s=>t.push(`@import "${s}";`))),s=`<style>${t.join("\n")};</style>${s}`}return s}async validate(){}}export{s as BaseParser};