async function a(n){n.selectionType!="none"&&await crs.call("grid_columns","add_columns",{element:n,columns:[{title:"uncheck",field:"_selected:selected()",width:34,classes:["selection"]}]})}async function s(n,e){const c=e.parentElement.dataset.index,o=Array.from(e.parentNode.children).indexOf(e),t=n.columns[o];e.textContent=e.textContent=="check"?"uncheck":"check",await n.modifyRecord(c,t.field,e.textContent,t.convert)}async function d(n,e){console.log(`mark all for selection: ${e}`)}export{a as addSelectionFeature,d as markAllSelected,s as markSelected};