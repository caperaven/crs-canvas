async function m(t,o,e){const c=e?.folder||"/",i=crsbinding.utils.relativePathFrom(c,t.getAttribute("markdown")),s=await fetch(i).then(l=>l.text()),d=await crs.call("markdown","to_html",{markdown:s}),n=document.createElement("template");n.innerHTML=d;const r=n.content.cloneNode(!0);await crsbinding.parsers.parseElements(r.children,o,e);const a=t.parentElement;a.insertBefore(r,t),a.removeChild(t)}crsbinding.templateProviders.add("markdown",m);
