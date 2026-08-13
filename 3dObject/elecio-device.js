/* ============================================================
   ELECIO Smart DNC - device geometry, as a reusable factory.
   Extracted verbatim from elecio_smart_dnc_3d_v7.html so the
   housing, decals, OLED and DB-25 stay a single source of truth.

   Needs THREE r128 on the page first (classic script, no modules,
   so it also runs from file://).

     const dev = ElecioDevice.create({finish:'black'});
     scene.add(dev.group);
     dev.setScreen('receiving', 0.4);

   Everything is in MILLIMETRES: the case is 80 x 80 x 24.5, the
   front face looks down +Z, and the DB-25 leaves the -Y edge.
   ============================================================ */
(function(global){
"use strict";
const THREE = global.THREE;
if(!THREE){ console.error('ElecioDevice: load three.js r128 first'); return; }

/* ============================================================
   0. constants — millimetres, scaled off the DB-25 (38.96 mm shell,
      47.04 mm screw pitch) which fixes the case at 80 mm square
   ============================================================ */
const W = 80, R_CORNER = 12;       // face width / corner radius
const HALF_D = 12.25;              // half depth  (24.5 mm total)
const FILLET = 2.8;                // edge fillet radius
const FACE = HALF_D;               // front face plane
const PLATE = 2.2;                 // cover-plate thickness = pocket depth
const FLOOR = FACE - PLATE;        // pocket floor
const TAU = Math.PI * 2;
const FONT = '"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

const FINISH = {
  black:{ shell:0x1c1f24, inner:0x121419, cap:0xdcd8cc, bezel:0x090b0e,
          rough:0.57, normalScale:0.45, clearcoat:0.26,
          decal:'rgba(146,152,162,.95)', decalBack:'rgba(170,176,186,.92)' },
  white:{ shell:0xeceae5, inner:0xc7c6c1, cap:0xa7abab, bezel:0x0f1216,
          rough:0.42, normalScale:0.28, clearcoat:0.38,
          decal:'rgba(92,97,105,.96)', decalBack:'rgba(80,85,93,.96)' }
};

/* ============================================================
   1. 2-D helpers
   ============================================================ */
function rrPoints(w,h,r,seg){
  seg = seg||10;
  r = Math.min(r, Math.min(w,h)/2);
  const x = w/2 - r, y = h/2 - r, p = [];
  const arc=(cx,cy,a0)=>{ for(let i=0;i<=seg;i++){ const a=a0+i/seg*(Math.PI/2);
      p.push(new THREE.Vector2(cx+Math.cos(a)*r, cy+Math.sin(a)*r)); } };
  arc( x, y, 0);  arc(-x, y, Math.PI/2);  arc(-x,-y, Math.PI);  arc( x,-y, Math.PI*1.5);
  return p;
}
function circlePoints(rad,seg){
  const p=[]; seg=seg||44;
  for(let i=0;i<seg;i++){const a=i/seg*TAU;p.push(new THREE.Vector2(Math.cos(a)*rad,Math.sin(a)*rad));}
  return p;
}
/* D-sub cross-section: rounded rect tapered toward the bottom */
function dSubPoints(wTop,wBot,h,r){
  return rrPoints(wTop,h,r,6).map(v=>{
    const k = 1-(1-wBot/wTop)*(0.5 - v.y/h);
    return new THREE.Vector2(v.x*k, v.y);
  });
}
function place(pts,cx,cy,rot){
  const c=Math.cos(rot||0), s=Math.sin(rot||0);
  return pts.map(v=>new THREE.Vector2(v.x*c-v.y*s+cx, v.x*s+v.y*c+cy));
}
const shapeOf = pts => new THREE.Shape(pts);
const pathOf  = pts => { const p=new THREE.Path(); p.setFromPoints(pts); p.closePath(); return p; };

function slab(shape, thickness, bevel, curveSeg){
  const b = bevel||0;
  const g = new THREE.ExtrudeGeometry(shape,{
    depth: Math.max(0.01, thickness-2*b), bevelEnabled: b>0,
    bevelThickness: b, bevelSize: b, bevelOffset:0, bevelSegments: b>0?3:0,
    curveSegments: curveSeg||14, steps:1
  });
  g.translate(0,0,b);
  return g;
}

/* ============================================================
   2a. radial descriptions of the two boundary curves
       outline  = rounded square 80 / R12  (the silhouette)
       plateau  = rounded octagon          (the raised front face)
       the shoulder is lofted between them
   ============================================================ */
const PL = {half:32, diag:46};        // plateau: |x|,|y| <= 32 and |x|+|y| <= 46
const WALL_TOP = 8.85;                // z where the side wall ends
const NSEG = 300;

function outlineRadius(th){
  const ux=Math.cos(th), uy=Math.sin(th), a=W/2, c=a-R_CORNER;
  if(Math.abs(ux)>1e-9){ const t=a/Math.abs(ux); if(Math.abs(t*uy)<=c) return t; }
  if(Math.abs(uy)>1e-9){ const t=a/Math.abs(uy); if(Math.abs(t*ux)<=c) return t; }
  const Cx=c*Math.sign(ux||1), Cy=c*Math.sign(uy||1);
  const b=ux*Cx+uy*Cy, cc=Cx*Cx+Cy*Cy-R_CORNER*R_CORNER;
  return b+Math.sqrt(Math.max(0,b*b-cc));
}
function plateauRadiusRaw(th){
  const ax=Math.abs(Math.cos(th)), ay=Math.abs(Math.sin(th));
  let r=1e9;
  if(ax>1e-9) r=Math.min(r, PL.half/ax);
  if(ay>1e-9) r=Math.min(r, PL.half/ay);
  return Math.min(r, PL.diag/(ax+ay));
}
/* sample both curves, smoothing the plateau so its junctions are radiused */
const ANG=[], R_OUT=[], R_PL=[];
(function(){
  const raw=[];
  for(let i=0;i<NSEG;i++){ const th=i/NSEG*TAU; ANG.push(th);
    R_OUT.push(outlineRadius(th)); raw.push(plateauRadiusRaw(th)); }
  const k=5;                                   // smoothing half-window
  for(let i=0;i<NSEG;i++){
    let s=0,n=0;
    for(let j=-k;j<=k;j++){ s+=raw[(i+j+NSEG)%NSEG]; n++; }
    R_PL.push(s/n);
  }
})();
const ptOut = i => new THREE.Vector2(Math.cos(ANG[i])*R_OUT[i], Math.sin(ANG[i])*R_OUT[i]);
const ptPl  = (i,grow) => { const r=R_PL[i]+(grow||0);
  return new THREE.Vector2(Math.cos(ANG[i])*r, Math.sin(ANG[i])*r); };
function plateauShapePoints(grow){
  const p=[]; for(let i=0;i<NSEG;i++) p.push(ptPl(i,grow)); return p;
}

/* shoulder profile: blend 0 = on the outline, 1 = on the plateau */
const SHOULDER = [[0.00,WALL_TOP],[0.05,9.62],[0.12,10.12],[0.30,10.92],
                  [0.55,11.55],[0.80,12.02],[1.00,FACE]];
const NROW = 40;                       // resampled rows: fine enough to emboss
const SLOT_C = 29.2;                   // slot centre, on each diagonal
const SLOT_HL = 5.0, SLOT_R = 3.0;     // capsule half-length / radius, in plan
const SLOT_DEPTH = 0.85, SLOT_WALL = 0.95;

/* z(b) = wall + drop*(1-(1-b)^2): steepest at the rim, perfectly flat where
   it meets the plateau, so the two surfaces meet tangentially - no seam line */
function shoulderRow(u){
  const drop=FACE-WALL_TOP;
  return [u, WALL_TOP+drop*(1-(1-u)*(1-u))];
}
/* depth of the corner-slot depression at a point on the face */
function slotDepth(x,y){
  let d=0;
  for(let sx=-1;sx<=1;sx+=2) for(let sy=-1;sy<=1;sy+=2){
    const cx=sx*SLOT_C, cy=sy*SLOT_C;
    const ax=sx*Math.SQRT1_2, ay=sy*Math.SQRT1_2;
    let t=(x-cx)*ax+(y-cy)*ay;
    t=Math.max(-SLOT_HL,Math.min(SLOT_HL,t));
    const dist=Math.hypot(x-cx-ax*t, y-cy-ay*t)-SLOT_R;
    if(dist<SLOT_WALL){
      let k=Math.max(0,Math.min(1,-dist/SLOT_WALL));
      k=k*k*(3-2*k);                              // smoothstep wall
      d=Math.max(d,SLOT_DEPTH*k);
    }
  }
  return d;
}

function buildShoulder(){
  const rows=[]; for(let j=0;j<NROW;j++) rows.push(shoulderRow(j/(NROW-1)));
  const row=NSEG+1, pos=[], uv=[], idx=[];
  for(let j=0;j<NROW;j++){
    const b=rows[j][0], z=rows[j][1];
    for(let i=0;i<=NSEG;i++){
      const k=i%NSEG, o=ptOut(k), p=ptPl(k,0);
      pos.push(o.x+(p.x-o.x)*b, o.y+(p.y-o.y)*b, z);
      uv.push(i/NSEG*5.2, 0.72+b*0.28);
    }
  }
  for(let j=0;j<NROW-1;j++) for(let i=0;i<NSEG;i++){
    const a=j*row+i, b2=a+1, c=a+row, d=c+1;
    idx.push(a,b2,c, b2,d,c);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals();

  /* emboss the four corner slots into the surface */
  const P=g.attributes.position, N=g.attributes.normal;
  for(let v=0;v<P.count;v++){
    const x=P.getX(v), y=P.getY(v), z=P.getZ(v);
    const d=slotDepth(x,y);
    if(d>0) P.setXYZ(v, x-N.getX(v)*d, y-N.getY(v)*d, z-N.getZ(v)*d);
  }
  P.needsUpdate=true; g.computeVertexNormals();
  return g;
}

/* side wall + rear fillet, swept along the outline */
function buildRim(){
  const N=NSEG;
  const nrm=[];
  for(let i=0;i<N;i++){
    const a=ptOut((i-1+N)%N), b=ptOut((i+1)%N);
    const t=new THREE.Vector2(b.x-a.x,b.y-a.y).normalize();
    nrm.push(new THREE.Vector2(t.y,-t.x));
  }
  const prof=[], K=8, zw=HALF_D-FILLET;
  for(let i=0;i<=K;i++){ const a=i/K*Math.PI/2;
    prof.push([FILLET*(1-Math.sin(a)), -zw-FILLET*Math.cos(a)]); }
  prof.push([0,-6.4],[0.32,-6.10],[0.32,-5.25],[0,-4.95],[0,WALL_TOP]);

  const M=prof.length, pos=[], uv=[], idx=[];
  for(let j=0;j<M;j++) for(let i=0;i<=N;i++){
    const k=i%N, p=ptOut(k), n=nrm[k];
    pos.push(p.x-n.x*prof[j][0], p.y-n.y*prof[j][0], prof[j][1]);
    uv.push(i/N*5.2,(prof[j][1]+HALF_D)/(HALF_D*2));
  }
  const row=N+1;
  for(let j=0;j<M-1;j++) for(let i=0;i<N;i++){
    const a=j*row+i, b=a+1, c=a+row, d=c+1;
    idx.push(a,c,b, b,c,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* ---- corner slots: pockets lying in the corner facet ------- */
function shoulderPointAtDiagonal(b, sx, sy){
  const th=Math.atan2(sy,sx);
  const rOut=outlineRadius(th), rPl=plateauRadiusRaw(th);
  const r=rOut+(rPl-rOut)*b;
  let z=SHOULDER[0][1];
  for(let j=0;j<SHOULDER.length-1;j++){
    const b0=SHOULDER[j][0], b1=SHOULDER[j+1][0];
    if(b>=b0 && b<=b1){ const f=(b-b0)/(b1-b0);
      z=SHOULDER[j][1]+(SHOULDER[j+1][1]-SHOULDER[j][1])*f; break; }
  }
  return {r:r, z:z};
}
/* place a mesh in the plane of the corner facet */
function facetMatrix(sx,sy,len){
  const th=Math.atan2(sy,sx), ux=Math.cos(th), uy=Math.sin(th);
  const rOut=outlineRadius(th), rPl=plateauRadiusRaw(th), span=rOut-rPl;
  const half=len/2;
  const bMid=0.5;
  const mid=shoulderPointAtDiagonal(bMid,sx,sy);
  const bIn =bMid+half/span, bOut=bMid-half/span;
  const pIn =shoulderPointAtDiagonal(Math.min(1,bIn), sx,sy);
  const pOut=shoulderPointAtDiagonal(Math.max(0,bOut),sx,sy);
  const dr=pOut.r-pIn.r, dz=pOut.z-pIn.z;
  const L=Math.hypot(dr,dz);
  const ex=new THREE.Vector3(ux*dr/L, uy*dr/L, dz/L);          // local +x, outward
  const ez=new THREE.Vector3(ux*-dz/L, uy*-dz/L, dr/L).normalize(); // facet normal
  const ey=new THREE.Vector3().crossVectors(ez,ex).normalize();
  const cx=(pIn.r+pOut.r)/2, cz=(pIn.z+pOut.z)/2;
  const m=new THREE.Matrix4();
  m.makeBasis(ex,ey,ez);
  m.setPosition(ux*cx, uy*cx, cz);
  return m;
}

/* ============================================================
   3. feature layout, measured from the photographs
   ============================================================ */
const INSET = W - FILLET*2;                 // 74.4, used by the rear plate
const BEV   = 0.15;                         // pocket-mouth chamfer
const CORNER_SIGNS = [[-1,1],[1,1],[-1,-1],[1,-1]];
const SLOT = {len:14.5, wid:6.0};
const DISPLAY = {w:24, h:14.0, y:12.9, activeW:21.7, activeH:10.9};
const KEY = {n:3, gap:13.4, y:-9.6, pocket:11.4, cap:8.6, bezel:11.2};
const VENTS = [[0,23.1,45],[0.9,18.7,50],[-1.4,14.3,40],
               [-1.4,-14.3,40],[0.9,-18.7,50],[0,-23.1,45]];
const SCREWS = [[-28.2,28.2],[28.2,28.2],[-28.2,-28.2],[28.2,-28.2]];
const KEYHOLES = [[-27.6,0],[27.6,0]];
const PLAQUE = {w:40, h:24, y:-0.6};
const SW_X = -19.4, JK_X = 24.1;
const DB = {shellW:38.96, shellWb:36.4, shellH:12.55, flangeW:53.04, flangeH:16.33,
            stick:6.8, screwPitch:23.5};

/* ============================================================
   4. procedural textures
   ============================================================ */
const CANVAS = 1200;
const PX = CANVAS / W;                       // canvas px per mm
function cv(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
const X = mm => CANVAS/2 + mm*PX;
const Y = mm => CANVAS/2 - mm*PX;

function fitText(g,text,weight,targetMM){
  g.font = weight+' 100px '+FONT;
  const w = g.measureText(text).width || 100;
  const size = 100 * (targetMM*PX) / w;
  g.font = weight+' '+size.toFixed(1)+'px '+FONT;
  return size;
}

function grainNormal(){
  const S=512, h=new Float32Array(S*S);
  for(let i=0;i<S*S;i++) h[i]=Math.random();
  const sm=new Float32Array(S*S);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    let s=0; for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) s+=h[((y+dy+S)%S)*S+((x+dx+S)%S)];
    sm[y*S+x]=s/9*0.65 + h[y*S+x]*0.35;
  }
  const out=cv(S,S), o=out.getContext('2d'), oi=o.createImageData(S,S);
  const at=(x,y)=>sm[((y+S)%S)*S+((x+S)%S)];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const dx=(at(x+1,y)-at(x-1,y))*2.3, dy=(at(x,y+1)-at(x,y-1))*2.3, i=(y*S+x)*4;
    oi.data[i]=128-dx*127; oi.data[i+1]=128-dy*127; oi.data[i+2]=255; oi.data[i+3]=255;
  }
  o.putImageData(oi,0,0);
  const t=new THREE.CanvasTexture(out);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(8,8);
  return t;
}

/* ELECIO trefoil, traced from the engraving:
   3 outer rings R, centres at 0.835R from the middle on a 120 deg triad,
   each holding an inner ring of 0.70R offset 0.35R outward and rotated -30 deg */
function drawMark(g,cx,cy,hMM,color){
  /* traced from the engraving: three woven rings of radius R on a 120 deg
     triad at 0.84R, each broken where it passes under a neighbour (a 26 deg
     gap facing the centre and a 20 deg gap 57 deg round), plus a full
     concentric ring at 0.533R.  Stroke 0.112R, total height 3.372R */
  const H=hMM*PX, R=H/3.372, d=0.84*R, D=Math.PI/180;
  g.save();
  g.translate(cx, cy + 0.25*d);
  g.strokeStyle=color; g.lineWidth=Math.max(1,0.112*R); g.lineCap='butt';
  for(let k=0;k<3;k++){
    const a=-Math.PI/2 + k*TAU/3;
    const ox=Math.cos(a)*d, oy=Math.sin(a)*d, aIn=a+Math.PI;
    g.beginPath(); g.arc(ox,oy,R, aIn+13*D, aIn+47*D); g.stroke();
    g.beginPath(); g.arc(ox,oy,R, aIn+67*D, aIn+347*D); g.stroke();
    g.beginPath(); g.arc(ox,oy,0.533*R,0,TAU); g.stroke();
  }
  g.restore();
}

function frontDecal(f){
  const c=cv(CANVAS,CANVAS), g=c.getContext('2d');
  g.fillStyle=f.decal; g.strokeStyle=f.decal; g.textBaseline='alphabetic';
  /* engraving ratios, in units of the ELECIO cap height H:
     ELECIO w 3.646H | SMART DNC w 3.389H, cap 0.531H | baselines 0.894H apart
     mark 1.673H wide x 1.611H tall, 0.239H clear of the text, vertically centred */
  const EW=19.5, H=EW/3.646;
  drawMark(g, X(-6.1-0.239*H-1.673*H/2), Y(25.2-0.894*H/2+0.5*H-0.035*H), 1.611*H, f.decal);
  g.textAlign='left';
  fitText(g,'ELECIO','700',EW);              g.fillText('ELECIO', X(-6.1), Y(25.2));
  fitText(g,'SMART DNC','600',3.389*H);      g.fillText('SMART DNC', X(-6.1+0.044*H), Y(25.2-0.894*H));
  g.textAlign='center';
  fitText(g,'ENTER','700',10.4);
  g.fillText('ENTER', X(-KEY.gap), Y(-18.9));
  g.fillText('DOWN',  X(0),        Y(-18.9));
  g.fillText('UP',    X(KEY.gap),  Y(-18.9));
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8;
  return t;
}

function backDecal(f, model){
  const c=cv(CANVAS,CANVAS), g=c.getContext('2d');
  g.fillStyle=f.decalBack; g.textAlign='left'; g.textBaseline='middle';
  const suffix=model.split('-')[1];
  const lines=['Model Num: '+model,'Default IP: 192.168.4.1',
               'WiFi SSID: Elecio-'+suffix,'WiFi Pass: Elecio-'+suffix];
  fitText(g,lines[0],'500',33.0);
  lines.forEach((t,i)=> g.fillText(t, X(-17.0), Y(8.6-i*6.0)));
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8;
  return t;
}

/* one ON/OFF pair and one DC IN pair — as on the moulding */
function edgeDecal(f){
  const w=CANVAS, h=Math.round(CANVAS/3), c=cv(w,h), g=c.getContext('2d');
  const EY = mm => h/2 - mm*PX;
  g.fillStyle=f.decal; g.textBaseline='middle'; g.textAlign='center';
  fitText(g,'OFF','700',5.0);
  g.fillText('ON',  X(-7.6), EY(2.3));
  g.fillText('OFF', X(-7.6), EY(-2.3));
  g.fillText('DC',  X(14.0), EY(2.3));
  g.fillText('IN',  X(14.0), EY(-2.3));
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8;
  return t;
}

/* ------------------------------------------------------------
   the 128 x 64 dual-colour OLED.  one canvas per device, redrawn
   in place, so the panel can animate without churning textures.
   modes: 'off' | 'files' | 'receiving' | 'ready'
   ------------------------------------------------------------ */
function makeScreen(){
  const c = cv(512,256), g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
  /* the panel is redrawn while a transfer runs, so regenerating a mip
     chain on every update is pure cost - drop it and filter linearly */
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;

  const mx=(DISPLAY.w-DISPLAY.activeW)/DISPLAY.w*512/2;
  const my=(DISPLAY.h-DISPLAY.activeH)/DISPLAY.h*256/2;
  const sx=(512-2*mx)/128, sy=(256-2*my)/64;
  const P=(x,y)=>[mx+x*sx, my+y*sy];
  const rect=(x,y,w,h,col)=>{ g.fillStyle=col; const a=P(x,y); g.fillRect(a[0],a[1],w*sx,h*sy); };
  const YEL='#ffd400', CYA='#3fc4ff';
  const mono=px=>'700 '+(px*sy)+'px ui-monospace,Menlo,Consolas,monospace';

  function header(ip){
    g.strokeStyle=YEL; g.lineCap='round';
    for(let k=0;k<3;k++){
      g.lineWidth=1.3*sy; g.beginPath();
      const o=P(7,12.5);
      g.arc(o[0],o[1],(2.2+k*2.3)*sx,-Math.PI*0.78,-Math.PI*0.22); g.stroke();
    }
    rect(6.2,10.6,1.6,1.8,YEL);
    g.textBaseline='alphabetic'; g.fillStyle=YEL; g.font=mono(10.4);
    g.fillText(ip, P(15,13)[0], P(15,13)[1]);
    g.strokeStyle=YEL; g.lineWidth=1.2*sy;
    const ic=P(120,7.5);
    g.beginPath(); g.arc(ic[0],ic[1],4.4*sx,0,TAU); g.stroke();
    g.beginPath(); g.moveTo(ic[0],ic[1]-2.4*sy); g.lineTo(ic[0],ic[1]);
    g.lineTo(ic[0]+2.2*sx,ic[1]+1.2*sy); g.stroke();
    rect(0,15.5,128,1.4,YEL);
  }
  function list(rows){
    g.font=mono(12.6);
    rows.forEach((r,i)=>{
      const y=20+i*14.6;
      if(r[1]){ rect(1.5,y-1.5,g.measureText(r[0]).width/sx+3,12.6,CYA); g.fillStyle='#03050a'; }
      else g.fillStyle=CYA;
      g.fillText(r[0], P(3,y+9.4)[0], P(3,y+9.4)[1]);
    });
  }
  function draw(mode, progress, ip){
    g.fillStyle='#03050a'; g.fillRect(0,0,512,256);
    if(mode!=='off'){
      header(ip||'192.168.30.130');
      if(mode==='receiving'){
        const pc=Math.max(0,Math.min(1,progress||0));
        g.font=mono(12.6); g.fillStyle=CYA;
        g.fillText('RECEIVING', P(3,31)[0], P(3,31)[1]);
        g.strokeStyle=CYA; g.lineWidth=1.1*sy;
        const b=P(3,36); g.strokeRect(b[0],b[1],118*sx,9*sy);
        rect(4.4,37.4,115.2*pc,6.2,CYA);
        g.font=mono(11.0); g.fillStyle=YEL;
        g.fillText(Math.round(pc*100)+'%', P(3,60)[0], P(3,60)[1]);
        g.fillStyle=CYA;
        g.fillText('E4CF.NC', P(46,60)[0], P(46,60)[1]);
      } else if(mode==='ready'){
        list([['E4CF',true]]);
        g.font=mono(11.0); g.fillStyle=YEL;
        g.fillText('READY - PRESS ENTER', P(3,52)[0], P(3,52)[1]);
      } else {
        list([['E4CF',true],['PILIS',false],['PEACK',false]]);
      }
    }
    tex.needsUpdate = true;
  }
  return {texture:tex, draw:draw};
}

function envTexture(){
  const w=1024,h=512,c=cv(w,h),g=c.getContext('2d');
  const sky=g.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#414c5c'); sky.addColorStop(.47,'#1b212a');
  sky.addColorStop(.53,'#0a0d11'); sky.addColorStop(1,'#04060a');
  g.fillStyle=sky; g.fillRect(0,0,w,h);
  const box=(x,y,rw,rh,a)=>{ const r=g.createRadialGradient(x,y,0,x,y,Math.max(rw,rh));
    r.addColorStop(0,'rgba(255,255,255,'+a+')'); r.addColorStop(1,'rgba(255,255,255,0)');
    g.save(); g.translate(x,y); g.scale(1,rh/rw); g.fillStyle=r;
    g.beginPath(); g.arc(0,0,rw,0,TAU); g.fill(); g.restore(); };
  box(250,110,250,160,1.0);
  box(770,150,190,130,0.6);
  box(520, 50,440, 95,0.34);
  box(110,330,190,130,0.18);
  const t=new THREE.CanvasTexture(c);
  t.mapping=THREE.EquirectangularReflectionMapping; t.encoding=THREE.sRGBEncoding;
  return t;
}

/* shared across instances: the grain map and the three big decal
   canvases only ever get built once per finish */
let grain = null;
const _tex = {};
function tex(key, make){ return _tex[key] || (_tex[key] = make()); }

function decalMat(map){
  return new THREE.MeshStandardMaterial({map:map,transparent:true,roughness:0.55,metalness:0,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,depthWrite:false});
}

/* ============================================================
   factory
   ============================================================ */
function create(opts){
  opts = opts || {};
  const state = {
    finish : opts.finish || 'black',
    model  : opts.model  || 'ELECIO-AF7E60',
    screen : opts.screen === undefined ? 'files' : opts.screen,
    led    : opts.led    === undefined ? true : opts.led,
    shadows: opts.shadows === undefined ? true : opts.shadows
  };
  const M = {};
  const device = new THREE.Group();
  let PARTS = {};
  const screen = makeScreen();
  let progress = 0;

function buildMaterials(f){
  if(!grain) grain=grainNormal();
  M.shell=new THREE.MeshPhysicalMaterial({
    color:f.shell, roughness:f.rough, metalness:0,
    clearcoat:f.clearcoat, clearcoatRoughness:0.6,
    normalMap:grain, normalScale:new THREE.Vector2(f.normalScale,f.normalScale),
    envMapIntensity:1.15});
  M.floor=new THREE.MeshPhysicalMaterial({
    color:new THREE.Color(f.shell).multiplyScalar(0.72),
    roughness:Math.min(1,f.rough+0.14), metalness:0,
    normalMap:grain, normalScale:new THREE.Vector2(f.normalScale,f.normalScale),
    envMapIntensity:0.5});
  M.cavity=new THREE.MeshStandardMaterial({color:0x07080b,roughness:0.95,metalness:0});
  M.bezel=new THREE.MeshPhysicalMaterial({color:f.bezel,roughness:0.38,clearcoat:0.6,clearcoatRoughness:0.25});
  M.cap=new THREE.MeshPhysicalMaterial({color:f.cap,roughness:0.34,clearcoat:0.9,clearcoatRoughness:0.18,
    envMapIntensity:1.15});
  M.glass=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0.08,metalness:0,
    clearcoat:1,clearcoatRoughness:0.03,envMapIntensity:1.6});
  M.steel=new THREE.MeshStandardMaterial({color:0xc2c7ce,roughness:0.26,metalness:1.0,envMapIntensity:1.3});
  M.steelDark=new THREE.MeshStandardMaterial({color:0x8d939c,roughness:0.40,metalness:1.0});
  M.brass=new THREE.MeshStandardMaterial({color:0xd8c07a,roughness:0.28,metalness:1.0});
  M.rubber=new THREE.MeshStandardMaterial({color:0x121417,roughness:0.7,metalness:0});
  M.gloss=new THREE.MeshPhysicalMaterial({color:0x1a1d21,roughness:0.2,clearcoat:1,clearcoatRoughness:0.08});
  M.led=new THREE.MeshBasicMaterial({color:0x2f7dff});
}

function addMesh(geo,mat,parent){
  const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true;
  (parent||device).add(m); return m;
}

function build(f){
  while(device.children.length) device.remove(device.children[0]);
  buildMaterials(f); PARTS={};

  /* housing: side wall + rear fillet, then the front shoulder - */
  addMesh(buildRim(), M.shell);
  addMesh(buildShoulder(), M.shell);

  /* inner block: blocks sight-lines, its rear cap floors the back pockets */
  const block=slab(shapeOf(rrPoints(W-1.1,W-1.1,R_CORNER-0.55,20)), FLOOR+WALL_TOP-0.1, 0, 20);
  block.translate(0,0,-FLOOR);
  addMesh(block, [M.floor, M.shell]);

  /* front pocket floor, tucked under the cover plate ---------- */
  const ffl=slab(shapeOf(plateauShapePoints(-0.4)), 1.0, 0, 1);
  ffl.translate(0,0,FLOOR-1.0);
  addMesh(ffl, [M.floor, M.shell]);

  /* front cover plate sits on the plateau --------------------- */
  const fs=shapeOf(plateauShapePoints(BEV));
  fs.holes.push(pathOf(place(rrPoints(DISPLAY.w,DISPLAY.h,2.0,6),0,DISPLAY.y,0)));
  for(let i=0;i<KEY.n;i++)
    fs.holes.push(pathOf(place(rrPoints(KEY.pocket,KEY.pocket,1.5,6),(i-1)*KEY.gap,KEY.y,0)));
  const fp=slab(fs,PLATE,BEV,1); fp.translate(0,0,FLOOR);
  addMesh(fp, M.shell);

  /* back cover plate ---------------------------------------- */
  const bs=shapeOf(rrPoints(INSET+2*BEV,INSET+2*BEV,R_CORNER-FILLET+BEV,26));
  SCREWS.forEach(([x,y])=> bs.holes.push(pathOf(place(circlePoints(5.9,30),x,y,0))));
  KEYHOLES.forEach(([x,y])=> bs.holes.push(pathOf(place(rrPoints(13,26,6.5,9),x,y,0))));
  VENTS.forEach(([x,y,len])=> bs.holes.push(pathOf(place(rrPoints(len,3.0,1.5,5),x,y,0))));
  bs.holes.push(pathOf(place(rrPoints(PLAQUE.w,PLAQUE.h,2.8,6),0,PLAQUE.y,0)));
  const bp=slab(bs,PLATE,BEV,26); bp.translate(0,0,-FACE);
  addMesh(bp, M.shell);

  /* vent floors + status LED -------------------------------- */
  const ledGroup=new THREE.Group(); device.add(ledGroup); PARTS.led=ledGroup;
  VENTS.forEach(([x,y,len],i)=>{
    const g=slab(shapeOf(rrPoints(len+0.6,3.6,1.8,5)),0.6,0,5);
    g.translate(x,y,-FLOOR-0.6);
    addMesh(g, M.cavity);
    if(i<3){
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(len*0.42,2.2), M.led);
      gl.position.set(x-len*0.16,y,-FLOOR-0.64); gl.rotation.y=Math.PI;
      ledGroup.add(gl);
    }
  });
  const ledLight=new THREE.PointLight(0x3f8dff,0,70,2);
  ledLight.position.set(0,18,-8); ledGroup.add(ledLight); PARTS.ledLight=ledLight;

  /* display -------------------------------------------------- */
  const gw=DISPLAY.w-0.8, gh=DISPLAY.h-0.8;
  const glass=slab(shapeOf(rrPoints(gw,gh,1.5,6)),1.8,0.22,10);
  glass.translate(0,DISPLAY.y,FLOOR+0.1);
  PARTS.glass=addMesh(glass, M.glass); PARTS.gw=gw; PARTS.gh=gh;

  /* keys — bezel frame plus a cap that genuinely stands proud - */
  for(let i=0;i<KEY.n;i++){
    const x=(i-1)*KEY.gap;
    const ring=new THREE.Shape(rrPoints(KEY.bezel,KEY.bezel,1.4,7));
    ring.holes.push(pathOf(rrPoints(KEY.cap+0.5,KEY.cap+0.5,1.1,7)));
    const rg=slab(ring, PLATE+0.2, 0.16, 10); rg.translate(x,KEY.y,FLOOR);
    addMesh(rg, M.bezel);
    const cap=slab(shapeOf(rrPoints(KEY.cap,KEY.cap,1.1,8)), 3.05, 0.55, 10);
    cap.translate(x,KEY.y,FLOOR+0.5);              // top ≈ 1.35 mm above the face
    addMesh(cap, M.cap);
  }

  /* rear hardware -------------------------------------------- */
  SCREWS.forEach(([x,y])=>{
    const head=new THREE.Mesh(new THREE.CylinderGeometry(4.1,4.0,1.5,30), M.steelDark);
    head.rotation.x=Math.PI/2; head.position.set(x,y,-FLOOR-0.75);
    head.castShadow=true; device.add(head);
    for(let k=0;k<2;k++){
      const s=new THREE.Mesh(new THREE.BoxGeometry(5.4,1.0,0.6), M.cavity);
      s.position.set(x,y,-FLOOR-1.45); s.rotation.z=(k?Math.PI/2:0)+0.5;
      device.add(s);
    }
    const ring=new THREE.Shape(circlePoints(7.6,34));
    ring.holes.push(pathOf(circlePoints(5.8,34)));
    const boss=slab(ring,1.2,0.35,1); boss.translate(x,y,-FACE-1.2);
    addMesh(boss, M.shell);
  });
  KEYHOLES.forEach(([x,y])=>{
    const slot=slab(shapeOf(rrPoints(5.2,21,2.6,7)),0.5,0,7); slot.translate(x,y,-FLOOR-0.5);
    addMesh(slot, M.cavity);
    const hole=slab(shapeOf(circlePoints(4.6,26)),0.5,0,1); hole.translate(x,y,-FLOOR-0.5);
    addMesh(hole, M.cavity);
  });
  [[-19.4,11.3],[18.8,2.4]].forEach(([x,y])=>{
    const b=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,0.8,14), M.brass);
    b.rotation.x=Math.PI/2; b.position.set(x,y,-FLOOR-0.35); device.add(b);
  });

  /* decals ---------------------------------------------------- */
  const fd=new THREE.Mesh(new THREE.PlaneGeometry(W,W), decalMat(tex('front:'+state.finish, function(){return frontDecal(f);})));
  fd.position.z=FACE+0.03; device.add(fd);
  const bd=new THREE.Mesh(new THREE.PlaneGeometry(W,W), decalMat(tex('back:'+state.finish+':'+state.model, function(){return backDecal(f,state.model);})));
  bd.position.z=-FLOOR-0.07; bd.rotation.y=Math.PI; device.add(bd);
  const ed=new THREE.Mesh(new THREE.PlaneGeometry(W,W/3), decalMat(tex('edge:'+state.finish, function(){return edgeDecal(f);})));
  ed.rotation.x=-Math.PI/2; ed.position.set(0,W/2+0.03,0); device.add(ed);

  /* power edge: switch + DC jack ------------------------------ */
  const EY=W/2;
  const swCollar=new THREE.Mesh(new THREE.CylinderGeometry(7.25,7.4,2.4,40), M.rubber);
  swCollar.position.set(SW_X,EY+0.8,0); swCollar.castShadow=true; device.add(swCollar);
  const swWell=new THREE.Mesh(new THREE.CylinderGeometry(5.3,5.3,1.8,32), M.cavity);
  swWell.position.set(SW_X,EY+1.5,0); device.add(swWell);
  const swBtn=new THREE.Mesh(new THREE.SphereGeometry(5.0,36,22,0,TAU,0,Math.PI/2), M.gloss);
  swBtn.scale.set(1,0.45,1); swBtn.position.set(SW_X,EY+1.7,0); swBtn.castShadow=true; device.add(swBtn);

  const jkOuter=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.2,1.8,36), M.steel);
  jkOuter.position.set(JK_X,EY+0.6,0); jkOuter.castShadow=true; device.add(jkOuter);
  const jkIn=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,4.0,32), M.cavity);
  jkIn.position.set(JK_X,EY-0.6,0); device.add(jkIn);
  const jkPin=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,3.6,16), M.brass);
  jkPin.position.set(JK_X,EY-1.0,0); device.add(jkPin);

  /* serial edge: DB-25 male ----------------------------------- */
  const db=new THREE.Group(); db.rotation.x=Math.PI/2; db.position.y=-W/2; device.add(db);
  const flange=slab(shapeOf(rrPoints(DB.flangeW,DB.flangeH,1.6,7)),1.6,0.3,8);
  flange.translate(0,0,-1.2);                       // sits 0.4 mm proud
  db.add(new THREE.Mesh(flange, M.steel));
  const shellGeo=slab(shapeOf(dSubPoints(DB.shellW,DB.shellWb,DB.shellH,1.6)),DB.stick,0.4,10);
  shellGeo.translate(0,0,0.4);
  const shellMesh=new THREE.Mesh(shellGeo, M.steel); shellMesh.castShadow=true; db.add(shellMesh);
  const insGeo=slab(shapeOf(dSubPoints(DB.shellW-3.4,DB.shellWb-3.0,DB.shellH-3.2,1.2)),DB.stick-1.8,0.25,10);
  insGeo.translate(0,0,0.9);
  db.add(new THREE.Mesh(insGeo, M.cavity));
  const pinGeo=new THREE.CylinderGeometry(0.55,0.46,4.6,10);
  const pinRow=(n,y)=>{ const x0=-(n-1)*2.77/2;
    for(let i=0;i<n;i++){ const p=new THREE.Mesh(pinGeo, M.brass);
      p.rotation.x=Math.PI/2; p.position.set(x0+i*2.77, y, DB.stick-2.0); db.add(p); } };
  pinRow(13, 1.42); pinRow(12,-1.42);
  [-DB.screwPitch, DB.screwPitch].forEach(x=>{
    const j=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,4.4,6), M.steelDark);
    j.rotation.x=Math.PI/2; j.rotation.y=Math.PI/6; j.position.set(x,0,1.9); j.castShadow=true; db.add(j);
  });

  applyToggles();
}

  function applyToggles(){
    if(PARTS.glass){
      const t = screen.texture;
      t.repeat.set(1/PARTS.gw, 1/PARTS.gh); t.offset.set(0.5,0.5);
      const m = PARTS.glass.material;
      m.map = t; m.emissiveMap = t;
      m.emissive.setHex(0xffffff);
      m.emissiveIntensity = state.screen === 'off' ? 0.0 : 1.3;
      m.needsUpdate = true;
    }
    screen.draw(state.screen, progress, opts.ip);
    if(PARTS.led){
      PARTS.led.visible = !!state.led;
      PARTS.ledLight.intensity = state.led ? (opts.ledIntensity || 1.6) : 0;
      PARTS.led.children.forEach(function(c){
        if(c.material && c.material.color) c.material.color.setHex(state.ledColor || 0x2f7dff);
      });
    }
  }

  build(FINISH[state.finish]);
  if(!state.shadows) device.traverse(function(o){ o.castShadow=false; o.receiveShadow=false; });

  return {
    group: device,
    parts: PARTS,
    /* where the DB-25 ends, in device space - hang the serial cable here */
    portAnchor: new THREE.Vector3(0, -(W/2 + DB.stick + 1.5), 0),
    setFinish: function(name){
      if(!FINISH[name] || name === state.finish) return;
      state.finish = name; build(FINISH[name]);
    },
    setScreen: function(mode, p){
      state.screen = mode; progress = p || 0;
      applyToggles();
    },
    setLed: function(on, color, intensity){
      state.led = !!on;
      if(color !== undefined) state.ledColor = color;
      if(intensity !== undefined) opts.ledIntensity = intensity;
      applyToggles();
    },
    dispose: function(){
      device.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });
      screen.texture.dispose();
    }
  };
}

global.ElecioDevice = {
  create: create,
  envTexture: envTexture,
  FINISH: FINISH,
  /* handy numbers for whatever scene this drops into */
  SIZE: {width:W, depth:HALF_D*2, face:FACE, dbStick:DB.stick}
};
})(window);
