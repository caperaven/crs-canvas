import{markSelected as c,markAllSelected as n}from"./selection.js";async function i(t){t._clickHandler=a.bind(t),t.addEventListener("click",t._clickHandler)}async function r(t){t.removeEventListener("click",t._clickHandler),t._clickHandler=null}async function a(t){if(t.preventDefault(),t.target.dataset.field=="_selected")return await c(this,t.target);if(t.target.classList.contains("selection")){const e=t.target.textContent=="check";return await n(this,!e),t.target.textContent=e?"uncheck":"check"}}export{r as disableInput,i as enableInput};