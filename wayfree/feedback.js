'use strict';
(()=>{
 const endpoint='https://formspree.io/f/xqakzbge';
 const button=document.createElement('button');button.className='feedback-launch';button.textContent='反馈 / 报告问题';button.type='button';button.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');dialog.className='report-dialog';dialog.setAttribute('aria-labelledby','report-title');
 dialog.innerHTML=`<form id="report-form"><div class="switch-row"><h2 id="report-title">告诉我们，哪里可以更好</h2><button type="button" class="icon-btn" id="report-close" aria-label="关闭反馈">✕</button></div><label class="field">反馈类型<select name="category"><option>费用计算问题</option><option>行程安排问题</option><option>酒店 / 景点信息问题</option><option>页面操作问题</option><option>其他建议</option></select></label><label class="field">发生了什么？<textarea name="message" required minlength="5" maxlength="3000" rows="5" placeholder="例如：选成都、2人、7天，精打细算比心愿优先更贵。也可以写下你希望的效果。"></textarea></label><label class="field">联系邮箱（选填）<input name="email" type="email" maxlength="200" autocomplete="email" placeholder="方便我们联系你，可留空"></label><label class="checkline"><input name="context" type="checkbox" checked><span>附上当前城市、人数、预算、偏好和方案估价，帮助排查</span></label><details class="report-preview"><summary>查看将附上的信息</summary><pre id="report-context"></pre></details><p class="small">反馈经 Formspree 发送至站长后台，不会公开展示。不自动附带姓名、年龄、出发地、具体出行日期或自定义行程内容；请勿填写证件等敏感信息。</p><p id="report-status" role="status" aria-live="polite"></p><button class="btn primary" id="report-send" type="submit">提交反馈</button></form>`;
 document.body.append(button,dialog);
 const form=dialog.querySelector('form'),status=dialog.querySelector('#report-status'),send=dialog.querySelector('#report-send');let context={},reportId='',pending=false;
 function newId(){return 'WF-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
 button.onclick=()=>{context=window.WayfreeFeedbackContext?.()||{version:'2026.11.21-budget-fix'};dialog.querySelector('#report-context').textContent=JSON.stringify(context,null,2);dialog.showModal();form.elements.message.focus()};
 dialog.querySelector('#report-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 form.addEventListener('submit',async e=>{e.preventDefault();if(pending||!form.reportValidity())return;pending=true;send.disabled=true;send.textContent='正在提交…';status.textContent='';reportId ||=newId();
 const payload={_subject:'Wayfree 用户反馈',source:'Wayfree',report_id:reportId,category:form.elements.category.value,message:form.elements.message.value.trim(),version:'2026.11.21-budget-fix'};
 if(form.elements.email.value.trim())payload.email=form.elements.email.value.trim();if(form.elements.context.checked)payload.planning_context=JSON.stringify(context);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const result=await response.json().catch(()=>({}));if(!response.ok||result.ok!==true)throw new Error('提交未确认');status.textContent='后台已接收，谢谢！反馈编号：'+reportId;form.elements.message.value='';form.elements.email.value='';reportId='';}
 catch{status.textContent='暂时未能确认后台接收。内容仍保留在此窗口；请检查网络后再试，避免连续重复提交。'}
 finally{clearTimeout(timeout);pending=false;send.disabled=false;send.textContent='提交反馈'}
 });
})();
