import"./dialog.js";class h{static async defineSizes(a,s,o,i){globalThis.dialogSizes||={},Object.assign(globalThis.dialogSizes,a.args)}static async show(a,s,o,i){const l=await crs.process.getValue(a.args.header,s,o,i),g=await crs.process.getValue(a.args.main,s,o,i),e=await crs.process.getValue(a.args.footer,s,o,i),t=await crs.process.getValue(a.args.target,s,o,i),c=await crs.process.getValue(a.args.position,s,o,i),n=await crs.process.getValue(a.args.anchor,s,o,i),r=await crs.process.getValue(a.args.size,s,o,i),d={target:t,position:c,anchor:n,size:r};(await u()).show(l,g,e,d)}static async force_close(a,s,o,i){globalThis.dialog&&(globalThis.dialog=globalThis.dialog.dispose())}}async function u(){return globalThis.dialog||(globalThis.dialog=document.createElement("dialog-component"),document.body.appendChild(globalThis.dialog)),globalThis.dialog}crs.intent.dialog=h;
