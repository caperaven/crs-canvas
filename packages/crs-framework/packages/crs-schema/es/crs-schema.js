async function r(r){const e=new s(r);return await e.parser.initialize(),e}"undefined"!=typeof self&&(self.crs=self.crs||{},self.crs.createSchemaLoader=r);class s{constructor(r){this.parser=r}dispose(){this.parser.dispose(),this.parser=null}validate(r){const s=[];return this.parser.validate(r,s),s}parse(r){return this.parser.parse(r)}load(r){return new Promise(async s=>{await this.parser.load(r),s(this)})}register(r){this.parser.register(r)}}export{r as createSchemaLoader};
//# sourceMappingURL=crs-schema.js.map