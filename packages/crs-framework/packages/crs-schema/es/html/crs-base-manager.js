class e{constructor(e){this.parser=e,this.isManager=!0}dispose(){this.reset(),delete this.parser}reset(){}assert(e,s,t){const r=1==e();return r&&s.push(t),!r}validate(e,s){if(null!=e.elements)for(let t of e.elements)this.parser.validateItem(t,s)}reset(){}}export{e as BaseManager};
//# sourceMappingURL=crs-base-manager.js.map
