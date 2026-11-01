"""Bake original dialogue with local Kokoro neural voices; ship only encoded Ogg.
Setup and model URLs are documented in graphics/NEURAL-VOICES.md.
"""
from pathlib import Path
import argparse,json,subprocess,tempfile,hashlib,os
os.environ.setdefault('OMP_NUM_THREADS','2')
import onnxruntime as ort
import soundfile as sf
import numpy as np
from kokoro_onnx import Kokoro
parser=argparse.ArgumentParser();parser.add_argument('--model-dir',type=Path,required=True);args=parser.parse_args()
r=Path(__file__).resolve().parents[1]
shots=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {PROLOGUE_SHOTS} from './null-district/systems/prologue-script.js'; console.log(JSON.stringify(PROLOGUE_SHOTS))"],cwd=r.parent))
# Bound CPU inference threads, leaving the editor and game responsive during baking.
original_session=ort.InferenceSession
def session(*a,**kw):
 options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1;kw['sess_options']=options
 return original_session(*a,**kw)
ort.InferenceSession=session
model=args.model_dir/'kokoro-v1.0.onnx';voices=args.model_dir/'voices-v1.0.bin'
k=Kokoro(str(model),str(voices))
# This official export accepts float speed; kokoro-onnx 0.5.0 sends int32
# for its input_ids branch. Preserve fractional delivery speeds explicitly.
run=k.sess.run;delivery_speed=1.0
def typed_run(outputs,inputs,*a,**kw):
 inputs['speed']=np.asarray([delivery_speed],dtype=np.float32)
 return run(outputs,inputs,*a,**kw)
k.sess.run=typed_run
cast={'courier':('am_michael',1.02,'en-us'),'vesper':('af_heart',1.02,'en-us'),'care':('bf_emma',1.0,'en-gb'),'regent':('bm_george',.94,'en-gb')}
filters={
 'courier':'highpass=f=75,lowpass=f=10500',
 'vesper':'highpass=f=95,lowpass=f=10000,aecho=0.8:0.7:35:0.035',
 'care':'highpass=f=110,lowpass=f=9500',
 'regent':'highpass=f=65,lowpass=f=10000,aecho=0.8:0.7:80:0.065'}
meta={};manifest={'engine':'kokoro-onnx 0.5.0 / Kokoro v1.0','cast':{key:{'voice':v,'speed':speed,'language':lang}for key,(v,speed,lang)in cast.items()},'modelSha256':hashlib.sha256(model.read_bytes()).hexdigest(),'voicesSha256':hashlib.sha256(voices.read_bytes()).hexdigest(),'clips':{}}
out=r/'graphics/audio/prologue';out.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='null-neural-',dir='/tmp')as temp:
 for shot in shots:
  for line in shot['lines']:
   voice,speed,lang=cast[line['speaker']];delivery_speed=speed;text=line['text'].replace('Mournfang','Morn fang').replace('Rainline','Rain line').replace('Shin-Kuro','Shin Kuro')
   audio,rate=k.create(text,voice=voice,speed=speed,lang=lang)
   wav=Path(temp)/(line['id']+'.wav');sf.write(wav,audio,rate,subtype='PCM_16');ogg=out/(line['id']+'.ogg')
   chain=filters[line['speaker']]+',loudnorm=I=-18:TP=-2:LRA=8,apad=pad_dur=0.14'
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af',chain,'-ar','24000','-ac','1','-c:a','libvorbis','-q:a','5',str(ogg)],check=True)
   duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(ogg)]));meta[line['id']]=round(duration,3)
   manifest['clips'][line['id']]={'text':line['text'],'speaker':line['speaker'],'duration':meta[line['id']],'sha256':hashlib.sha256(ogg.read_bytes()).hexdigest()}
   print(line['id'],voice,meta[line['id']],flush=True)
(r/'systems/prologue-voices.js').write_text('// Generated durations of bundled original neural dialogue.\nexport const VOICE_DURATIONS='+json.dumps(meta,indent=2)+';\n')
(out/'voice-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Baked',len(meta),'neural voice clips;',round(sum(meta.values()),1),'seconds of speech.',flush=True)
