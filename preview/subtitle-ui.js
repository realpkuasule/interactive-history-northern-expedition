const frame=document.querySelector('iframe'),label=document.querySelector('#subtitleText'),voice=document.querySelector('#voiceEnabled'),status=document.querySelector('#voiceStatus');
voice.addEventListener('change',()=>frame.contentWindow.historyNarration?.setVolume(voice.checked?1:0));
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.source!=='history-caption')return;
 label.textContent=e.data.text||'　';status.textContent=e.data.available?'Radio Host · 合成语速1.1 · 同步字幕':'本节点配音正在准备';
});
