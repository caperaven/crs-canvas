class d{static async perform(e,a,s,c){await this[e.action](e,a,s,c)}static async set_records(e,a,s,c){const l=await crs.dom.get_element(e.args.element,a,s,c),i=await crs.process.getValue(e.args.items),o=l.dataset.idField||"id",n={available:[],selected:[]};for(const t of i)t[o]=t[o]||i.indexOf(t),t.selected===!0?n.selected.push(t):n.available.push(t);const r=async()=>{await l.update(n)};await crs.call("component","on_ready",{element:l,callback:r,caller:this})}static async get_selected_records(e,a,s,c){return await(await crs.dom.get_element(e.args.element))?.getSelectedItems()}}crs.intent.available_selected=d;export{d as AvailableSelectedActions};
