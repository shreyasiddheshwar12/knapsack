let workloads = [];
let lastResult = null;
const $ = id => document.getElementById(id);

function escapeHtml(value) {
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function renderRows() {
    const tbody = $('rows'); tbody.innerHTML = '';
    workloads.forEach((item,index) => {
        const ratio = Number(item.weight) > 0 ? (Number(item.value)/Number(item.weight)).toFixed(2) : '—';
        const status = lastResult ? (lastResult.selected_indices.includes(index) ? 'YES' : 'NO') : '—';
        const cls = status === 'YES' ? 'yes' : status === 'NO' ? 'no' : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${index+1}</td><td><input data-field="name" data-index="${index}" value="${escapeHtml(item.name)}"></td><td><input data-field="weight" data-index="${index}" type="number" min="0" value="${item.weight}"></td><td><input data-field="value" data-index="${index}" type="number" min="0" value="${item.value}"></td><td class="ratio">${ratio}</td><td><span class="status ${cls}">${status}</span></td><td><button class="remove" data-remove="${index}" title="Remove">×</button></td>`;
        tbody.appendChild(tr);
    });
}

function getPayload() {
    return {capacity:Number($('capacity').value), workloads:workloads.map(x=>({name:x.name,weight:Number(x.weight),value:Number(x.value)}))};
}

async function runKnapsack() {
    $('error').textContent=''; $('runBtn').disabled=true; $('runBtn').textContent='Running…';
    try {
        const payload=getPayload();
        if (!Number.isInteger(payload.capacity)||payload.capacity<0) throw new Error('Capacity must be a non-negative whole number.');
        const response=await fetch('/api/optimize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const data=await response.json(); if(!response.ok) throw new Error(data.error||'Optimization failed.');
        lastResult=data; renderResult(data); renderRows(); animateDP(data);
    } catch(err) { $('error').textContent=err.message; }
    finally { $('runBtn').disabled=false; $('runBtn').textContent='▶ Run Knapsack'; }
}

function renderResult(data) {
    const cap=Number($('capacity').value);
    $('maxValue').textContent=data.max_value; $('used').textContent=data.used; $('remaining').textContent=data.remaining; $('selectedCount').textContent=data.selected.length; $('capacityHero').textContent=cap;
    $('barFill').style.width=(cap===0?0:Math.min(100,data.used/cap*100))+'%';
    $('decisionBadge').textContent='OPTIMAL'; $('decisionBadge').className='badge good';
    $('resultText').textContent=`The optimal combination uses ${data.used} of ${cap} resource units and produces ${data.max_value} business value.`;
    const list=$('selectedList'); list.innerHTML='';
    if(!data.selected.length) list.innerHTML='<div class="empty">No workload can fit within the available capacity.</div>';
    data.selected.forEach(item=>{const div=document.createElement('div');div.className='selected-item';div.innerHTML=`<div><b>${escapeHtml(item.name)}</b><br><small>Resource cost: ${item.weight}</small></div><b>+${item.value}</b>`;list.appendChild(div);});
    $('decisionLog').innerHTML=`<b>Python backend:</b> DP table calculated → backtracking performed → <b>${data.selected.length}</b> workloads selected → maximum value = <b>${data.max_value}</b>.`;
}

function animateDP(data) {
    const wrap=$('dpTable'), cap=Number($('capacity').value), dp=data.dp;
    let html='<table class="dp"><thead><tr><th>Item \\ Capacity</th>';
    for(let c=0;c<=cap;c++) html+=`<th>${c}</th>`;
    html+='</tr></thead><tbody>';
    for(let i=0;i<=workloads.length;i++) { const label=i===0?'0 items':`${i}. ${escapeHtml(workloads[i-1].name)}`; html+=`<tr><th>${label}</th>`; for(let c=0;c<=cap;c++) html+=`<td id="cell-${i}-${c}">${dp[i][c]}</td>`; html+='</tr>'; }
    html+='</tbody></table>'; wrap.innerHTML=html;
    let delay=0;
    for(let i=0;i<=workloads.length;i++) for(let c=0;c<=cap;c++) { const cell=$(`cell-${i}-${c}`); setTimeout(()=>cell.classList.add('active'),delay); delay+=8; }
}

$('rows').addEventListener('input',e=>{
    const index=Number(e.target.dataset.index), field=e.target.dataset.field;
    if(Number.isInteger(index)&&field){ workloads[index][field]=field==='name'?e.target.value:Number(e.target.value); lastResult=null; renderRows(); }
});
$('rows').addEventListener('click',e=>{ if(e.target.dataset.remove!==undefined){ workloads.splice(Number(e.target.dataset.remove),1); lastResult=null; renderRows(); } });
$('capacity').addEventListener('input',()=>{ $('capacityHero').textContent=$('capacity').value; lastResult=null; renderRows(); });
$('addBtn').addEventListener('click',()=>{ workloads.push({name:`New Workload ${workloads.length+1}`,weight:1,value:10}); lastResult=null; renderRows(); });
$('demoBtn').addEventListener('click',async()=>{ const r=await fetch('/api/demo'); const d=await r.json(); $('capacity').value=d.capacity; workloads=d.workloads.map(x=>({...x})); lastResult=null; renderRows(); $('capacityHero').textContent=d.capacity; });
$('runBtn').addEventListener('click',runKnapsack);

(async()=>{ const r=await fetch('/api/demo'); const d=await r.json(); $('capacity').value=d.capacity; workloads=d.workloads.map(x=>({...x})); $('capacityHero').textContent=d.capacity; renderRows(); })();
