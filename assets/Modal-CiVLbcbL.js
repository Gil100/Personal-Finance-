var r=(i,e)=>()=>(e||i((e={exports:{}}).exports,e),e.exports);var d=r((m,a)=>{class n{constructor(e={}){this.options={title:"",content:"",size:"medium",closable:!0,backdrop:!0,keyboard:!0,actions:[],onOpen:null,onClose:null,...e},this.isOpen=!1,this.element=null}render(){if(this.element)return this.element;const e=document.createElement("div");e.className="modal-overlay",e.style.display="none",this.options.backdrop&&e.addEventListener("click",s=>{s.target===e&&this.close()});const t=document.createElement("div");if(t.className=this.getContentClasses(),this.options.title||this.options.closable){const s=this.createHeader();t.appendChild(s)}const o=this.createBody();if(t.appendChild(o),this.options.actions&&this.options.actions.length>0){const s=this.createFooter();t.appendChild(s)}return e.appendChild(t),this.element=e,this.options.keyboard&&document.addEventListener("keydown",this.handleKeydown.bind(this)),e}getContentClasses(){const e=["modal-content"];return this.options.size!=="medium"&&e.push(`modal-${this.options.size}`),e.join(" ")}createHeader(){const e=document.createElement("div");if(e.className="modal-header",this.options.title){const t=document.createElement("h3");t.className="modal-title",t.textContent=this.options.title,e.appendChild(t)}if(this.options.closable){const t=document.createElement("button");t.className="modal-close",t.innerHTML="×",t.addEventListener("click",()=>this.close()),e.appendChild(t)}return e}createBody(){const e=document.createElement("div");return e.className="modal-body",typeof this.options.content=="string"?e.innerHTML=this.options.content:this.options.content instanceof HTMLElement&&e.appendChild(this.options.content),e}createFooter(){const e=document.createElement("div");return e.className="modal-footer",this.options.actions.forEach(t=>{const o=this.createActionButton(t);e.appendChild(o)}),e}createActionButton(e){const t=document.createElement("button");return t.className=`btn btn-${e.type||"secondary"}`,t.textContent=e.text,e.disabled&&(t.disabled=!0),t.addEventListener("click",()=>{e.handler?e.handler(this)!==!1&&this.close():e.close!==!1&&this.close()}),t}open(){this.isOpen||(this.element||(this.render(),document.body.appendChild(this.element)),this.element.style.display="flex",this.isOpen=!0,document.body.style.overflow="hidden",this.options.onOpen&&this.options.onOpen(this),setTimeout(()=>{const e=this.element.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');e&&e.focus()},100))}close(){this.isOpen&&(this.element.style.display="none",this.isOpen=!1,document.body.style.overflow="",this.options.onClose&&this.options.onClose(this))}destroy(){this.close(),this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element),this.element=null}handleKeydown(e){e.key==="Escape"&&this.isOpen&&this.close()}setContent(e){if(!this.element)return;const t=this.element.querySelector(".modal-body");t&&(typeof e=="string"?t.innerHTML=e:e instanceof HTMLElement&&(t.innerHTML="",t.appendChild(e)))}setTitle(e){if(!this.element)return;const t=this.element.querySelector(".modal-title");t&&(t.textContent=e)}}class l{static confirm(e,t,o){return new n({title:"אישור פעולה",content:`<p>${e}</p>`,size:"small",actions:[{text:"ביטול",type:"secondary",handler:()=>(o&&o(),!0)},{text:"אישור",type:"primary",handler:()=>(t&&t(),!0)}]})}static alert(e,t="הודעה"){return new n({title:t,content:`<p>${e}</p>`,size:"small",actions:[{text:"הבנתי",type:"primary"}]})}static error(e,t="שגיאה"){return new n({title:t,content:`<div style="color: var(--error-color); display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="font-size: var(--font-size-2xl);">⚠️</span>
                        <p>${e}</p>
                      </div>`,size:"small",actions:[{text:"סגור",type:"error"}]})}static success(e,t="הצלחה"){return new n({title:t,content:`<div style="color: var(--success-color); display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="font-size: var(--font-size-2xl);">✅</span>
                        <p>${e}</p>
                      </div>`,size:"small",actions:[{text:"סגור",type:"success"}]})}static addTransaction(){const e=`
            <form class="modal-form">
                <div class="form-group">
                    <label class="form-label">סכום *</label>
                    <input type="text" class="form-input form-input-currency" placeholder="0.00" required>
                </div>
                <div class="form-group">
                    <label class="form-label">תיאור *</label>
                    <input type="text" class="form-input" placeholder="תיאור העסקה..." required>
                </div>
                <div class="form-group">
                    <label class="form-label">קטגוריה *</label>
                    <select class="form-input" required>
                        <option value="">בחר קטגוריה...</option>
                        <option value="food">מזון ומשקאות</option>
                        <option value="transport">תחבורה</option>
                        <option value="housing">דיור</option>
                        <option value="health">בריאות</option>
                        <option value="education">חינוך</option>
                        <option value="entertainment">בילויים</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">תאריך</label>
                    <input type="date" class="form-input" value="${new Date().toISOString().split("T")[0]}">
                </div>
            </form>
        `;return new n({title:"הוסף עסקה חדשה",content:e,size:"medium",actions:[{text:"ביטול",type:"secondary"},{text:"שמור עסקה",type:"primary",handler:t=>{const o=t.element.querySelector(".modal-form"),s=new FormData(o);return console.log("Saving transaction:",Object.fromEntries(s)),l.success("העסקה נשמרה בהצלחה!").open(),!0}}]})}static exportData(){const e=`
            <div class="export-options">
                <h4>בחר פורמט יצוא:</h4>
                <div class="form-group">
                    <label class="form-label">
                        <input type="radio" name="format" value="csv" checked> CSV (Excel)
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="radio" name="format" value="pdf"> PDF
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="radio" name="format" value="json"> JSON
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label">תקופה:</label>
                    <select class="form-input">
                        <option value="month">החודש הנוכחי</option>
                        <option value="quarter">הרבעון הנוכחי</option>
                        <option value="year">השנה הנוכחית</option>
                        <option value="all">כל הנתונים</option>
                    </select>
                </div>
            </div>
        `;return new n({title:"יצא נתונים",content:e,size:"medium",actions:[{text:"ביטול",type:"secondary"},{text:"יצא",type:"primary",handler:()=>(console.log("Exporting data..."),l.success("הנתונים יוצאו בהצלחה!").open(),!0)}]})}}const c=`
.modal-small {
    max-width: 400px;
}

.modal-large {
    max-width: 1000px;
}

.modal-full {
    max-width: 95vw;
    max-height: 95vh;
}

.modal-form .form-group {
    margin-bottom: var(--spacing-md);
}

.export-options .form-group {
    margin-bottom: var(--spacing-sm);
}

.export-options h4 {
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
}
`;if(!document.getElementById("modal-size-styles")){const i=document.createElement("style");i.id="modal-size-styles",i.textContent=c,document.head.appendChild(i)}typeof a<"u"&&a.exports?a.exports={Modal:n,HebrewModals:l}:(window.Modal=n,window.HebrewModals=l)});export default d();
//# sourceMappingURL=Modal-CiVLbcbL.js.map
