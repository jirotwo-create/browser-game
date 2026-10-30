"""Bake original dialogue with installed CMU Flite voices; no TTS runtime is shipped.
Run from the repository root on a system with libflite and FFmpeg installed.
"""
from pathlib import Path
import ctypes, json, subprocess, tempfile
r=Path(__file__).resolve().parents[1]
script="import {PROLOGUE_SHOTS} from './null-district/systems/prologue-script.js'; console.log(JSON.stringify(PROLOGUE_SHOTS))"
shots=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=r.parent))
f=ctypes.CDLL('libflite.so.1',mode=ctypes.RTLD_GLOBAL);f.flite_init()
f.flite_text_to_speech.argtypes=[ctypes.c_char_p,ctypes.c_void_p,ctypes.c_char_p];f.flite_text_to_speech.restype=ctypes.c_float
voices={}
for person,voice in [('courier','awb'),('vesper','slt'),('care','kal16'),('regent','rms')]:
 lib=ctypes.CDLL('libflite_cmu_us_'+voice+'.so.1',mode=ctypes.RTLD_GLOBAL)
 fn=getattr(lib,'register_cmu_us_'+voice);fn.restype=ctypes.c_void_p;fn.argtypes=[ctypes.c_char_p];voices[person]=fn(None)
filters={
 'courier':'highpass=f=100,lowpass=f=5200,acompressor=threshold=0.12:ratio=2,volume=1.2',
 'vesper':'asetrate=16800,aresample=24000,highpass=f=260,lowpass=f=4500,aecho=0.8:0.5:45:0.14,volume=1.15',
 'care':'highpass=f=210,lowpass=f=5800,acompressor=threshold=0.1:ratio=3,volume=1.25',
 'regent':'asetrate=14000,aresample=24000,highpass=f=80,lowpass=f=3800,aecho=0.8:0.6:110:0.25,volume=1.3'
}
meta={};out=r/'graphics/audio/prologue';out.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='null-voices-',dir='/tmp') as temp:
 for shot in shots:
  for line in shot['lines']:
   wav=Path(temp)/(line['id']+'.wav');text=line['text'].replace('Mournfang','Morn fang').replace('Shin-Kuro','Shin Kuro')
   f.flite_text_to_speech(text.encode(),voices[line['speaker']],str(wav).encode())
   ogg=out/(line['id']+'.ogg')
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af',filters[line['speaker']]+',alimiter=limit=0.88','-ar','24000','-ac','1','-c:a','libvorbis','-q:a','3',str(ogg)],check=True)
   duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(ogg)]));meta[line['id']]=round(duration,3)
(r/'systems/prologue-voices.js').write_text('// Generated durations of bundled, original synthesized dialogue.\nexport const VOICE_DURATIONS='+json.dumps(meta,indent=2)+';\n')
print('Baked',len(meta),'original dialogue clips;',round(sum(meta.values()),1),'seconds of speech.')
