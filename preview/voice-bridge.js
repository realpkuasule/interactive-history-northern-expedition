import{createNarrationStage}from'./native/narration-stage.mjs';
const plan=await(await fetch('voice-plan.json')).json();
// Local full-file blobs make MP3 seeking deterministic even on a basic offline HTTP server.
// Decoding, track positions and playback remain owned by the existing narration stage.
const urls=[],assets=new Array(plan.assets.length);let nextAsset=0;
// Four local readers avoid overwhelming the portable stdlib HTTP server backlog.
await Promise.all(Array.from({length:Math.min(4,plan.assets.length)},async()=>{
 while(nextAsset<plan.assets.length){const i=nextAsset++,a=plan.assets[i];
  const r=await fetch(a.file.path);if(!r.ok)throw Error('Missing local narration: '+a.id);
  const url=URL.createObjectURL(await r.blob());urls.push(url);assets[i]={...a,file:{...a.file,path:url}};
 }
}));
const narrator=createNarrationStage(plan,assets);await narrator.ready;
window.historyNarration=narrator;
addEventListener('pagehide',()=>{narrator.dispose();urls.forEach(u=>URL.revokeObjectURL(u))},{once:true});
window.historyVoice={plan,narrator,at(frame,node){
 const ms=1000*(frame-node.startFrame)/30;
 const cues=plan.captions[node.id]??[];const cue=cues.find(c=>ms>=c.startMs&&ms<c.endMs);
 const text=cue?.text??'';
 window.parent.postMessage({source:'history-caption',text,node:node.id,localMs:ms,cueId:cue?.id??null,available:plan.audioTracks.some(t=>t.id===node.id)},location.origin);
 narrator.update(frame);
}};
