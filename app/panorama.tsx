'use client';
import { useEffect,useRef,useState } from 'react';
import { Plus,Minus,RotateCcw } from 'lucide-react';
import * as THREE from 'three';
export default function Panorama({src}:{src:string}){
 const host=useRef<HTMLDivElement>(null),actions=useRef({zoom:(_n:number)=>{},reset:()=>{}});const [error,setError]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{
  const el=host.current;if(!el)return;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setError(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(75,1,.1,100);
  const geometry=new THREE.SphereGeometry(10,48,32);geometry.scale(-1,1,1);const material=new THREE.MeshBasicMaterial();scene.add(new THREE.Mesh(geometry,material));
  let yaw=0,pitch=0,down=false,lastX=0,lastY=0,disposed=false;let texture:THREE.Texture|undefined;
  const render=()=>{const p=THREE.MathUtils.degToRad(90-pitch),y=THREE.MathUtils.degToRad(yaw);camera.lookAt(10*Math.sin(p)*Math.cos(y),10*Math.cos(p),10*Math.sin(p)*Math.sin(y));renderer.render(scene,camera);};
  new THREE.TextureLoader().load(src,loaded=>{if(disposed){loaded.dispose();return;}texture=loaded;loaded.colorSpace=THREE.SRGBColorSpace;material.map=loaded;material.needsUpdate=true;setReady(true);render();},undefined,()=>{if(!disposed)setError(true);});
  const resize=()=>{camera.aspect=el.clientWidth/Math.max(1,el.clientHeight);camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);render();};
  const pointerDown=(e:PointerEvent)=>{down=true;lastX=e.clientX;lastY=e.clientY;el.setPointerCapture(e.pointerId);el.focus();};
  const pointerMove=(e:PointerEvent)=>{if(!down)return;yaw-=(e.clientX-lastX)*.16;pitch=Math.max(-70,Math.min(70,pitch+(e.clientY-lastY)*.16));lastX=e.clientX;lastY=e.clientY;render();};
  const pointerUp=()=>{down=false;};
  const zoom=(n:number)=>{camera.fov=Math.max(40,Math.min(100,camera.fov+n));camera.updateProjectionMatrix();render();};
  actions.current={zoom,reset:()=>{yaw=0;pitch=0;camera.fov=75;camera.updateProjectionMatrix();render();}};
  const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=5;if(e.key==='ArrowRight')yaw+=5;if(e.key==='ArrowUp')pitch=Math.min(70,pitch+5);if(e.key==='ArrowDown')pitch=Math.max(-70,pitch-5);if(e.key==='+')zoom(-5);if(e.key==='-')zoom(5);render();};
  const ro=new ResizeObserver(resize);ro.observe(el);el.addEventListener('pointerdown',pointerDown);el.addEventListener('pointermove',pointerMove);el.addEventListener('pointerup',pointerUp);el.addEventListener('pointercancel',pointerUp);el.addEventListener('keydown',key);resize();
  return()=>{disposed=true;ro.disconnect();el.removeEventListener('pointerdown',pointerDown);el.removeEventListener('pointermove',pointerMove);el.removeEventListener('pointerup',pointerUp);el.removeEventListener('pointercancel',pointerUp);el.removeEventListener('keydown',key);geometry.dispose();material.dispose();texture?.dispose();renderer.dispose();renderer.domElement.remove();};
 },[src]);
 return <div className="panorama"><div className="panorama-canvas" tabIndex={0} ref={host} role="application" aria-label="Panorama 360 graus. Arraste ou use as setas para olhar ao redor."/>{!ready&&!error&&<p className="panorama-status">Carregando a vista 360°…</p>}{error&&<div className="panorama-error"><p>Não foi possível abrir a vista interativa.</p><a href={src} target="_blank" rel="noopener noreferrer">Ver a imagem panorâmica</a></div>}<div className="panorama-controls"><span>ARRASTE PARA EXPLORAR</span><button onClick={()=>actions.current.zoom(-10)} aria-label="Aproximar"><Plus size={19}/></button><button onClick={()=>actions.current.zoom(10)} aria-label="Afastar"><Minus size={19}/></button><button onClick={()=>actions.current.reset()} aria-label="Restaurar vista inicial"><RotateCcw size={18}/></button></div></div>;
}
