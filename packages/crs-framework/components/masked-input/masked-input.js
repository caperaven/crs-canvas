class l extends HTMLInputElement{#i;#s;#h;async connectedCallback(){this.#h=this.#r.bind(this),this.#s=new u(this.dataset.mask,this.#h),this.#t(),this.#n()}async disconnectedCallback(){this.#i=crsbinding.utils.disposeProperties(this.#i),crsbinding.dom.disableEvents(this),this.#s=this.#s.dispose()}#t(){this.#i=Object.freeze({ArrowLeft:this.#s.moveIndexLeft.bind(this.#s),ArrowRight:this.#s.moveIndexRight.bind(this.#s),Backspace:this.#s.clearBack.bind(this.#s)})}#n(){crsbinding.dom.enableEvents(this),this.registerEvent(this,"focus",this.#e.bind(this)),this.registerEvent(this,"keydown",this.#u.bind(this)),this.registerEvent(this,"click",this.#l.bind(this))}#r(t,i){this.value=t,this.setSelectionRange(i,i)}async#e(t){t.preventDefault(),requestAnimationFrame(()=>{const i=this.#s.currentIndex;this.setSelectionRange(i,i)})}async#l(t){this.selectionEnd-this.selectionStart>1||(t.preventDefault(),requestAnimationFrame(()=>{if(this.#s.isFilled)return this.#s.setCursor(this.selectionStart);const i=this.#s.currentIndex;this.setSelectionRange(i,i)}))}async#u(t){if(!(t.key.toLowerCase()=="a"&&t.ctrlKey==!0)&&t.key!="Tab"&&t.shiftKey!=!0&&(t.preventDefault(),t.key!=" ")){if(this.#i[t.key]!=null)return this.#i[t.key](this.selectionStart,this.selectionEnd);if(this.selectionStart!=this.selectionEnd&&(this.#s.clearBack(this.selectionStart,this.selectionEnd),this.selectionEnd=this.selectionStart),t.key.length==1)return this.#s.set(t.key)}}}const e=Object.freeze(["0","#","_"]);class u{#i;#s;#h;#t;#n;get value(){return this.#s}get currentIndex(){return this.#t}get isFilled(){return this.#h.indexOf("_")==-1}constructor(t,i){this.#i=t,this.#n=i,this.#s=r(t),this.#h=this.#s.split(""),this.setCursor(0),this.#e()}dispose(){return this.#i=null,this.#s=null,this.#h=null,this.#t=null,this.#n=null,null}#r(){if(this.#t==this.#i.length)return!1;const t=this.#i[this.#t];return e.indexOf(t)!=-1==!0||(this.#t+=1,this.#r()),!0}#e(){this.#s=this.#h.join(""),this.#n?.(this.#s,this.#t)}setCursor(t){this.#t=t,this.#r(),this.#e()}set(t){this.#t!=this.#i.length&&this.#r()==!0&&a(this.#i[this.#t],t)&&(this.#h[this.#t]=t,this.#t+=1,this.#t>=this.#i.length&&(this.#t=this.#i.length),this.#e())}clearBack(t,i){if(t=t||this.#t,i=i||t,i-t==this.#i.length)return this.clear();if(i-t>1&&t!=null&&i!=null)return this.clear(t,i);if(this.#t==0)return;this.#t=t-1;const n=this.#i[this.#t];e.indexOf(n)!=-1?(this.#h[this.#t]="_",this.#e()):this.clearBack(t-1,i-1)}clear(t,i){if(t==null)return this.#h=r(this.#i).split(""),this.setCursor(0),this.#e();for(let h=t;h<i;h++){const n=this.#i[h];e.indexOf(n)!=-1&&(this.#h[h]="_")}this.setCursor(t),this.#e()}moveIndexLeft(){if(this.#t==0)return;let t=this.#i[this.#t-1];if(e.indexOf(t)!=-1)return this.#t-=1,this.#e();for(let i=this.#t;i>0;i--)if(t=this.#i[i-1],e.indexOf(t)!=-1){this.#t=i;break}return this.#e()}moveIndexRight(){if(this.#t+=1,this.#t>=this.#i.length)return this.#t=this.#i.length,this.#e();const t=this.#i[this.#t];e.indexOf(t)==-1&&this.moveIndexRight(),this.#e()}}function r(s){return s.split("0").join("_").split("#").join("_")}function a(s,t){const i=isNaN(t);return i==!0&&(s=="#"||s=="_")||i==!1&&(s=="#"||s=="0")}customElements.define("masked-input",l,{extends:"input"});export{u as MaskManager,l as MaskedInput,a as canEdit,r as maskToText};
