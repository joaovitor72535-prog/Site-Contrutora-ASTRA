'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

type Props = { journeyRef?: RefObject<HTMLElement | null>; onProgress?: (p: number) => void; reducedMotion?: boolean };
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(a:number,b:number,p:number)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};

export default function HouseScene({journeyRef,onProgress,reducedMotion=false}:Props) {
 const host=useRef<HTMLDivElement>(null);
 const [failed,setFailed]=useState(false);
 const callbacks=useRef({onProgress,reducedMotion});callbacks.current={onProgress,reducedMotion};
 useEffect(()=>{
  if(!host.current)return; const el:HTMLDivElement=host.current;
  const mobile=window.innerWidth<850;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile?1.5:1.75));
  renderer.setClearColor(0x101715,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.6;room.dispose();pmrem.dispose();
  const camera=new THREE.PerspectiveCamera(35,1,.08,150);
  scene.add(new THREE.HemisphereLight(0xe6f2db,0x4b5040,2));
  const sun=new THREE.DirectionalLight(0xfff0d4,3.7);sun.position.set(-5,16,9);sun.castShadow=true;
  sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.normalBias=.035;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xc6e6dc,1.4);fill.position.set(8,4,-7);scene.add(fill);
  const building=new THREE.Group();scene.add(building);
  const materials:THREE.Material[]=[];
  function material(color:number,roughness=.8,metalness=0){const m=new THREE.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m;}
  const concrete=material(0xd5d0ba),stone=material(0x7c8272),wood=material(0x886344),woodLight=material(0xa98960),metal=material(0x25332c,.4,.7),ground=material(0x233328),grass=material(0x536147),fabric=material(0xc8c2aa),cushion=material(0x737a50),black=material(0x18211d,.25,.35);
  const glass=new THREE.MeshPhysicalMaterial({color:0xa6c8bb,roughness:.08,metalness:.15,transparent:true,opacity:.21,side:THREE.DoubleSide,depthWrite:false});materials.push(glass);
  const glow=new THREE.MeshBasicMaterial({color:0xffdda0});materials.push(glow);
  const water=new THREE.MeshPhysicalMaterial({color:0x4b8981,metalness:.35,roughness:.16,transparent:true,opacity:.9});materials.push(water);
  const blueprint=new THREE.Group();building.add(blueprint);
  const wireMaterial=new THREE.LineBasicMaterial({color:0xc5e999,transparent:true,opacity:.48});materials.push(wireMaterial);
  const planMaterial=new THREE.LineBasicMaterial({color:0xd6f896,transparent:true,opacity:.83});materials.push(planMaterial);
  type Part={mesh:THREE.Mesh;start:number;duration:number;y:number;height:number;drop:boolean};const parts:Part[]=[];
  function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material,start=.2,duration=.15,drop=false,outline=false){
   const geometry=new THREE.BoxGeometry(w,h,d);const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;building.add(mesh);
   if(start>=0)parts.push({mesh,start,duration,y,height:h,drop});
   if(outline){const line=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),wireMaterial);line.position.copy(mesh.position);blueprint.add(line);}
   return mesh;
  }
  function lines(coords:number[],mat:THREE.LineBasicMaterial=planMaterial){const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));const line=new THREE.LineSegments(geom,mat);blueprint.add(line);return line;}
  // Architectural drawing remains readable before the structure is assembled.
  box(17,.27,14,0,-.24,0,ground,-1);box(12,.18,9,0,-.04,0,stone,-1);
  box(10.8,.18,7.6,0,.13,0,concrete,.16,.08,false,true);
  const planY=.235;
  for(const x of [-5.4,-1.4,2,5.4])lines([x,planY,-3.8,x,planY,3.8]);
  for(const z of [-3.8,0,3.8])lines([-5.4,planY,z,5.4,planY,z]);
  // Site dimensions, ticks and a door swing in the plan.
  lines([-6.3,.02,-3.8,-6.3,.02,3.8,-5.8,.02,-3.8,-6.6,.02,-3.8,-5.8,.02,3.8,-6.6,.02,3.8,-5.4,.02,4.7,5.4,.02,4.7,-5.4,.02,4.4,-5.4,.02,5,5.4,.02,4.4,5.4,.02,5]);
  const arc:number[]=[];for(let i=0;i<24;i++){const a=i/24*Math.PI/2,b=(i+1)/24*Math.PI/2;arc.push(-1.4+Math.cos(a)*1.1,planY,2.7+Math.sin(a)*1.1,-1.4+Math.cos(b)*1.1,planY,2.7+Math.sin(b)*1.1);}lines(arc);
  // Ground-floor frame and floating roof planes.
  for(const x of [-5.1,.4,5.1])for(const z of [-3.5,3.5])box(.24,3.3,.24,x,1.95,z,concrete,.23+(x+5.1)*.004,.17,false,true);
  box(11.4,.32,8.2,0,3.75,0,concrete,.34,.15,true,true);
  box(7.1,.3,7.5,-1.9,6.75,-.2,concrete,.43,.15,true,true);
  // Walls create an open living space and an upper cantilever.
  box(.22,3.3,7.1,-5.12,1.95,0,concrete,.32,.16,false,true);
  box(10.2,3.3,.2,0,1.95,-3.51,concrete,.35,.16,false,true);
  box(3.2,3.3,.22,3.5,1.95,3.5,wood,.4,.16,false,true);
  box(.22,2.7,7,-5.1,5.25,-.2,concrete,.41,.16,false,true);
  box(6.6,2.7,.22,-1.9,5.25,-3.6,concrete,.43,.15,false,true);
  box(.22,2.7,7,1.4,5.25,-.2,wood,.44,.16,false,true);
  box(3.3,2.7,.22,-3.55,5.25,3.3,concrete,.44,.16,false,true);
  // Glazing, mullions and warm timber brise-soleil.
  box(5.3,3.05,.04,-2.2,1.86,3.51,glass,.5,.11);
  for(let x=-4.9;x<=.6;x+=1.37)box(.05,3.2,.09,x,1.86,3.52,metal,.5,.1);
  box(.04,3.1,6.7,5.08,1.85,0,glass,.51,.11);
  for(let z=-3.3;z<3.5;z+=1.35)box(.08,3.2,.05,5.11,1.87,z,metal,.51,.1);
  box(3.15,2.6,.04,-.25,5.19,3.35,glass,.52,.1);
  for(let x=-1.65;x<1.3;x+=1.4)box(.06,2.7,.08,x,5.2,3.39,metal,.52,.1);
  for(let i=0;i<25;i++)box(.055,3.2,.1,2.04+i*.122,1.93,3.66,i%3?wood:woodLight,.47+i*.001,.12);
  for(let i=0;i<25;i++)box(.11,2.64,.055,1.56,5.23,-3.5+i*.275,i%3?wood:woodLight,.51,.12);
  // A roof terrace with glass balustrades.
  box(3.45,.09,7.05,3.48,3.95,0,wood,.5,.1);
  for(let z=-3.3;z<3.6;z+=.24)box(3.4,.015,.016,3.48,4.006,z,woodLight,.52,.1);
  box(3.5,1,.04,3.48,4.5,3.55,glass,.55,.1);box(.04,1,7,5.2,4.5,0,glass,.55,.1);
  box(3.6,.045,.06,3.48,5,3.55,metal,.55,.1);box(.06,.045,7.15,5.2,5,0,metal,.55,.1);
  // Front deck, approach and reflecting pool.
  for(let i=0;i<5;i++)box(1.6,.1,.4,1.18,.02-i*.025,4.3+i*.62,concrete,.5+i*.006,.1);
  box(4.6,.08,2.05,-3,.035,5.13,water,.57,.12);box(4.85,.12,.15,-3,.08,6.22,stone,.55,.1);
  box(.15,.12,2.22,-5.35,.08,5.18,stone,.55,.1);box(.15,.12,2.22,-.65,.08,5.18,stone,.55,.1);
  box(2.3,.12,10.7,7,.0,-.3,grass,.52,.15);
  // Living room: flooring, sofa, joinery, dining and lighting.
  for(let x=-4.9;x<5;x+=.32)box(.29,.02,6.75,x,.24,0,woodLight,.55,.08);
  box(3.7,.025,2.2,-2.35,.275,.45,cushion,.58,.08);
  box(3.0,.28,.95,-2.5,.57,-.65,fabric,.59,.1);box(3.1,.75,.2,-2.5,.91,-1.08,fabric,.59,.1);
  for(const x of [-3.85,-1.15])box(.22,.58,1.12,x,.77,-.61,fabric,.59,.1);
  for(let i=0;i<3;i++){box(.88,.16,.79,-3.43+i*.92,.79,-.55,fabric,.6,.1);const pillow=box(.55,.47,.14,-3.42+i*.94,1.05,-.91,i===1?cushion:fabric,.61,.1);pillow.rotation.x=-.16;}
  box(1.7,.09,.8,-2.5,.68,1,wood,.6,.1);for(const x of [-3.1,-1.9])for(const z of [.76,1.24])box(.055,.38,.055,x,.47,z,metal,.6,.1);
  box(.42,.065,.3,-2.7,.765,1.04,concrete,.62,.08);box(.31,.045,.25,-2.55,.815,1.05,cushion,.62,.08);
  box(.15,1.5,2.5,-4.96,1.9,.1,black,.58,.1);box(.4,.34,3.3,-4.78,.46,.1,wood,.58,.1);
  box(2.6,.12,1.1,2.95,1.12,-1.5,wood,.58,.1);
  for(const x of [2,3.9])for(const z of [-1.9,-1.1])box(.065,.82,.065,x,.65,z,metal,.58,.1);
  for(const x of [2.05,3.8])for(const z of [-2.5,-.5]){box(.55,.09,.54,x,.77,z,fabric,.6,.1);box(.55,.6,.07,x,1.08,z+(z<0&&z<-1?-.23:.23),fabric,.6,.1);for(const dx of [-.2,.2])for(const dz of [-.2,.2])box(.035,.5,.035,x+dx,.49,z+dz,metal,.6,.1);}
  box(4,.85,.65,1.8,.69,-3.06,wood,.58,.1);box(4.08,.08,.72,1.8,1.15,-3.06,concrete,.59,.1);
  for(let x=.1;x<3.7;x+=.65)box(.012,.7,.015,x,.72,-2.72,metal,.59,.1);
  box(4.3,.025,.035,-2.5,3.565,-1.35,glow,.61,.09);box(2.6,.04,.1,2.95,2.69,-1.5,metal,.62,.08);box(2.5,.016,.08,2.95,2.664,-1.5,glow,.62,.08);
  for(const x of [2.05,3.8])box(.014,.85,.014,x,3.14,-1.5,metal,.62,.08);
  const interiorLight=new THREE.PointLight(0xffd5a1,0,12,1.5);interiorLight.position.set(-1,2.8,.3);scene.add(interiorLight);
  // Deterministic vegetation, kept modest for phones.
  const foliage=material(0x70824c);const foliageDark=material(0x465b38);
  function plant(x:number,z:number,scale:number,start:number){
   const pot=new THREE.Mesh(new THREE.CylinderGeometry(.28*scale,.21*scale,.48*scale,10),stone);pot.position.set(x,.24*scale+.13,z);pot.castShadow=true;building.add(pot);parts.push({mesh:pot,start,duration:.12,y:pot.position.y,height:.48*scale,drop:false});
   for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.4*scale,8,6),i%2?foliage:foliageDark);leaf.scale.set(.5,1.55,.45);leaf.position.set(x+Math.sin(i*2.4)*.22*scale,.83*scale+.13,z+Math.cos(i*2.4)*.22*scale);leaf.rotation.z=Math.sin(i*2.4)*.6;leaf.castShadow=true;building.add(leaf);const wrapper=new THREE.Group();wrapper.position.copy(leaf.position);leaf.position.set(0,0,0);building.remove(leaf);wrapper.add(leaf);building.add(wrapper);vegetation.push({group:wrapper,start,scale:1});}
  }
  const vegetation:{group:THREE.Group;start:number;scale:number}[]=[];
  plant(-4.45,2.7,1.1,.62);plant(4.3,2.65,1.1,.63);plant(4.4,-2.65,1,.63);plant(4.5,-2.6,.9,.64);
  for(let i=0;i<7;i++)plant(7,-4.6+i*1.5,1.1+(i%3)*.2,.59+i*.006);
  const grid=new THREE.GridHelper(28,28,0x7b9369,0x40513b);grid.position.y=-.4;scene.add(grid);const gridMat=grid.material as THREE.Material;gridMat.transparent=true;gridMat.opacity=.34;
  const path=[
   {p:0,pos:new THREE.Vector3(16,18,22),look:new THREE.Vector3(0,1,0),fov:35},
   {p:.18,pos:new THREE.Vector3(16,13,21),look:new THREE.Vector3(0,1.5,0),fov:35},
   {p:.43,pos:new THREE.Vector3(17,10,19),look:new THREE.Vector3(0,2,0),fov:35},
   {p:.64,pos:new THREE.Vector3(13,8,20),look:new THREE.Vector3(0,2,0),fov:35},
   {p:.76,pos:new THREE.Vector3(4,4.4,17),look:new THREE.Vector3(-1,1.8,0),fov:42},
   {p:.88,pos:new THREE.Vector3(-.3,2.05,5.6),look:new THREE.Vector3(-2,1.5,-.2),fov:65},
   {p:1,pos:new THREE.Vector3(-.3,1.85,2.65),look:new THREE.Vector3(-2.9,1.4,-.35),fov:76},
  ];
  let current=0,target=0,raf=0,visible=true,disposed=false,lastTime=0;
  const position=new THREE.Vector3(),look=new THREE.Vector3();
  function render(p:number){
   const reduced=callbacks.current.reducedMotion;
   const visualP=reduced?.65:p;
   parts.forEach(({mesh,start,duration,y,height,drop})=>{const t=ease(start,start+duration,visualP);mesh.visible=t>.001;mesh.scale.y=Math.max(.001,t);mesh.position.y=drop?y+(1-t)*2.8:y-height/2+height*t/2;});
   vegetation.forEach(({group,start})=>{const t=ease(start,start+.12,visualP);group.visible=t>.001;group.scale.setScalar(t);});
   blueprint.visible=visualP<.59;wireMaterial.opacity=.45*(1-ease(.27,.58,visualP));planMaterial.opacity=.9*(1-ease(.22,.44,visualP));gridMat.opacity=.34*(1-ease(.67,.9,visualP));
   // Sliding glazing opens as the camera approaches the actual living room.
   building.children.forEach(o=>{if(o instanceof THREE.Mesh&&o.material===glass&&o.position.y<3.5&&o.position.z>3.4)o.visible=visualP<.8&&visualP>.5;});
   interiorLight.intensity=18*ease(.59,.77,visualP);
   let a=path[0],b=path[1];for(let i=1;i<path.length;i++){if(visualP<=path[i].p){a=path[i-1];b=path[i];break;}}
   const t=ease(a.p,b.p,visualP);position.lerpVectors(a.pos,b.pos,t);look.lerpVectors(a.look,b.look,t);
   if(window.innerWidth<850&&visualP<.77){const extra=1.15;position.sub(look).multiplyScalar(extra).add(look);}
   camera.position.copy(position);camera.lookAt(look);camera.fov=THREE.MathUtils.lerp(a.fov,b.fov,t);camera.updateProjectionMatrix();
   renderer.render(scene,camera);callbacks.current.onProgress?.(p);
  }
  function frame(time:number){raf=0;if(disposed||!visible||document.hidden)return;const dt=Math.min(64,time-lastTime||16);lastTime=time;const smoothing=1-Math.exp(-dt/90);current+= (target-current)*smoothing;if(Math.abs(target-current)<.0001)current=target;render(current);if(current!==target)raf=requestAnimationFrame(frame);}
  function request(){if(!raf&&!disposed&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
  function scroll(){const section=journeyRef?.current;if(section){const sticky=section.firstElementChild as HTMLElement;const distance=section.offsetHeight-(sticky?.offsetHeight||window.innerHeight);target=callbacks.current.reducedMotion?0:clamp(-section.getBoundingClientRect().top/Math.max(1,distance));}request();}
  function resize(){renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/Math.max(1,el.clientHeight);camera.updateProjectionMatrix();scroll();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(el);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){scroll();request();}},{rootMargin:'100px'});intersection.observe(el);
  const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);document.addEventListener('visibilitychange',request);window.addEventListener('carnegie-motion-change',request);
  resize();scroll();current=target;render(current);
  return()=>{disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersection.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',request);window.removeEventListener('carnegie-motion-change',request);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<THREE.BufferGeometry>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());grid.geometry.dispose();gridMat.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
 },[journeyRef]);
 return <div className="scene-host" ref={host} role="img" aria-label="Casa conceitual 3D que se constrói com a rolagem: planta, estrutura, acabamentos e entrada na sala">{failed&&<div className="webgl-fallback"><img src="/images/tour-exterior.jpg" alt="Projeto residencial do acervo Carnegie"/><p>A experiência 3D não está disponível neste dispositivo. Conheça os projetos e serviços abaixo.</p><a className="button primary" href="#sobre">Conhecer a Carnegie</a></div>}</div>;
}

