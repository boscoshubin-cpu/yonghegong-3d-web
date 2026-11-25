'use strict';

function gardenMap(file, repeatX, repeatY, color) {
  const texture = new THREE.TextureLoader().load('./assets/garden/' + file + '.webp');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  if (color) texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 4;
  return texture;
}

// The same branch and leaf construction is used for the courtyard and the wish tree.
function buildAutumnGarden(scene, makeTex) {
  let state = 912815;
  const rand = () => ((state = Math.imul(state, 1664525) + 1013904223 >>> 0) / 4294967296);
  const between = (a,b) => a + (b-a)*rand();
  const tau = 2*Math.PI;
  const clock = {value: 0};
  const transform = new THREE.Object3D();
  const vector = (x,y,z) => new THREE.Vector3(x,y,z);

  function fan(ctx, x, y, a, w, h, tint) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.scale(w,h);
    ctx.fillStyle = tint;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(-.15,-.22,-.62,-.59,-.55,-.86);
    ctx.bezierCurveTo(-.43,-1.04,-.16,-1.07,-.045,-.97);
    ctx.lineTo(.006,-.81); ctx.lineTo(.07,-.99);
    ctx.bezierCurveTo(.23,-1.07,.49,-1.01,.56,-.86);
    ctx.bezierCurveTo(.57,-.60,.21,-.29,0,0); ctx.fill();
    ctx.strokeStyle='rgba(74,48,15,.30)';ctx.lineWidth=.017;
    for(let j=-2;j<=2;j++){ctx.beginPath();ctx.moveTo(0,-.04);ctx.quadraticCurveTo(j*.051,-.54,j*.18,-.92);ctx.stroke();}
    ctx.restore();
  }
  function sprayTexture(type) {
    const palettes={gold:['#bd963b','#dec058','#efce69','#d5ae42','#e5c96b'], red:['#88623e','#a66235','#b98043','#cd9649','#a8814a']};
    return makeTex(384,384,(c,w,h)=>{
      const isPine=type==='pine';
      c.lineCap='round';
      function line(x,y,tx,ty,width,col){c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();}
      const n=isPine?13:8;
      for(let i=0;i<n;i++){
        const f=i/n, y=345-f*274, x=180+20*f*f;
        for(const side of [-1,1]){
          const dx=side*(1-f*.70)*between(92,142);
          const dy=-between(42,78);
          line(x,y,x+dx,y+dy,isPine?2.8:2.1,'#685035');
          for(let j=0;j<(isPine?20:9);j++){
            const q=(j+1)/(isPine?20:9),px=x+q*dx,py=y+q*dy;
            if(isPine){
              const ny=py-between(14,30)*(1-q*.7),nx=px+side*between(8,18);
              line(px,py,nx,ny,between(3,5),j%3===0?'#687746':'#465d42');
              line(px,py,nx+side*5,py+between(3,12),3.2,'#364e3e');
            }else{
              const ly=py+(j%2?1:-1)*between(7,14);
              const angle=side*between(.8,2.4)+(j%2?.38:-.45);
              const sz=between(17,27)*(1-.20*f);
              line(px,py,px+side*6,ly,1.1,'#856835');
              fan(c,px+side*6,ly,angle,sz,sz,palettes[type][Math.floor(rand()*5)]);
            }
          }
        }
      }
      line(179,370,199,45,2.7,'#695439');
    });
  }
  const bark=new THREE.MeshStandardMaterial({
    map:gardenMap('bark',1,1.4,true), normalMap:gardenMap('bark-normal',1,1.4,false),
    normalScale:new THREE.Vector2(.72,.72), roughness:.94, envMapIntensity:.22
  });
  const foliage={};
  for(const type of ['pine','gold','red']){
    const m=new THREE.MeshLambertMaterial({map:sprayTexture(type),alphaTest:.39,side:THREE.DoubleSide});
    m.emissive.setHex(type==='gold'?0x675222:type==='red'?0x583522:0x303d28);
    m.emissiveMap=m.map; m.emissiveIntensity=.42;
    m.onBeforeCompile=shader=>{
      shader.uniforms.uBreeze=clock;
      shader.vertexShader='uniform float uBreeze;\n'+shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed.x += uv.y*uv.y*(.046*sin(uBreeze*1.17+instanceMatrix[3].x*1.4+instanceMatrix[3].y)+.015*sin(uBreeze*2.8+instanceMatrix[3].z*2.));');
    };
    foliage[type]=m;
  }
  const sprayGeo=new THREE.PlaneGeometry(1,1,1,3);
  const cylinders=new THREE.CylinderGeometry(.68,1,1,9,3);
  const yAxis=vector(0,1,0);
  const palette=new THREE.Color();
  function addTree(group,type,scale) {
    const branches=[], sprays=[],tones=[];
    const pine=type==='pine',wish=type==='red';
    function segment(a,b,radius) {
      const dir=b.clone().sub(a); const len=dir.length();
      transform.position.copy(a).lerp(b,.5);
      transform.quaternion.setFromUnitVectors(yAxis,dir.normalize());
      transform.scale.set(radius,len,radius);transform.updateMatrix();branches.push(transform.matrix.clone());
    }
    function cluster(p,r) {
      for(let n=0;n<10;n++){
        const a=rand()*tau,q=Math.sqrt(rand())*r;
        transform.position.set(p.x+q*Math.cos(a),p.y+between(-.38,.48)*r,p.z+q*Math.sin(a));
        transform.rotation.set(between(-1.46,.94),rand()*tau,between(-1.2,1.2),'YXZ');
        const size=between(.98,1.64)*(pine?.93:1);
        transform.scale.set(size*between(.84,1.18),size,1);transform.updateMatrix();
        sprays.push(transform.matrix.clone()); tones.push(between(.67,1));
      }
    }
    const top=pine?8.4:wish?6.6:8.0;
    const lean=between(-.6,.6), sweep=between(-.35,.35);
    const stem=f=>vector(lean*f*f+.16*Math.sin(f*5),top*f,sweep*f);
    for(let k=0;k<8;k++)segment(stem(k/8),stem((k+1)/8),(.36*(1-k/8)+.045)*(wish?1.28:1));
    for(let k=0;k<8;k++){
      const a=k*tau/8+rand()*.22;
      segment(vector(Math.cos(a)*.16,.28,Math.sin(a)*.16),vector(Math.cos(a)*.78,.03,Math.sin(a)*.78),.16);
    }
    const levels=pine?19:15;
    const twist=rand()*tau;
    for(let k=0;k<levels;k++){
      const f=k/(levels-1),a=twist+k*2.39996+between(-.28,.28);
      const base=stem((wish?.46:pine?.29:.32)+f*(wish?.47:.62));
      const reach=(pine?(2.45*(1-f)+.42):(2.65*(1-f*.69)+.38))*between(.75,1.17);
      const lift=pine?between(-.16,.30):between(.55,1.10);
      const elbow=base.clone().add(vector(Math.cos(a)*reach*.49,lift*.45,Math.sin(a)*reach*.49));
      segment(base,elbow,.15*(1-f*.65));
      for(let j=0;j<3;j++){
        const b=a+(j-1)*between(.48,.96);
        const tip=elbow.clone().add(vector(Math.cos(b)*reach*.67,lift*.58+between(-.1,.6),Math.sin(b)*reach*.67));
        segment(elbow,tip,.075*(1-f*.58));cluster(tip,pine?.78:.92);
        if(j===1)cluster(elbow,.65);
      }
    }
    cluster(stem(1),.76);
    const wood=new THREE.InstancedMesh(cylinders,bark,branches.length);
    const crown=new THREE.InstancedMesh(sprayGeo,foliage[type],sprays.length);
    branches.forEach((m,i)=>wood.setMatrixAt(i,m));
    sprays.forEach((m,i)=>{crown.setMatrixAt(i,m);crown.setColorAt(i,palette.setRGB(tones[i],tones[i]*.98,tones[i]*.90));});
    for(const mesh of [wood,crown]){
      mesh.scale.setScalar(scale);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    }
    return wood;
  }
  const trees=[[-7.25,3.5,1.09],[7.25,4.6,1.2],[-10.8,14.5,1.12],[11,14.5,1.04],[-16.5,-5,1.22],[16.5,-5,1.22],[-18.5,-24,1.32],[18.5,-24,1.32]];
  trees.forEach(([x,z,s],i)=>{const g=new THREE.Group();g.position.set(x,0,z);addTree(g,i<4?'gold':'pine',s);scene.add(g);});

  // One slightly cupped, veined fan serves both the litter and the falling leaves.
  const leafTex=makeTex(96,96,(c,w,h)=>{fan(c,48,77,0,78,71,'#efd597');c.strokeStyle='#847140';c.lineWidth=2;c.beginPath();c.moveTo(48,76);c.lineTo(50,94);c.stroke();});
  const leafGeo=new THREE.PlaneGeometry(.22,.22,4,3);
  const pos=leafGeo.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setZ(i,Math.abs(pos.getX(i))*.22);
  leafGeo.computeVertexNormals();
  const leafMat=new THREE.MeshLambertMaterial({map:leafTex,alphaTest:.35,side:THREE.DoubleSide});
  const litter=new THREE.InstancedMesh(leafGeo,leafMat,510);
  const leafColors=[0x91703c,0xcbb469,0xb89b52,0xc7a34d,0x997b46];
  for(let i=0;i<litter.count;i++){
    const t=trees[i%4], a=rand()*tau,r=between(.6,5.1);
    const x=i%5?t[0]+Math.cos(a)*r:between(-5,5),z=i%5?t[1]+Math.sin(a)*r:between(-2,20);
    const onPath=Math.abs(x)<2.65, s=between(.72,1.42);
    transform.position.set(x,onPath?.116:.023,z);
    transform.rotation.set(-Math.PI/2+between(-.12,.12),between(-.12,.12),rand()*tau,'XYZ');
    transform.scale.setScalar(s);transform.updateMatrix();litter.setMatrixAt(i,transform.matrix);
    litter.setColorAt(i,palette.setHex(leafColors[i%5]));
  }
  litter.receiveShadow=true;scene.add(litter);
  const drifting=new THREE.InstancedMesh(leafGeo,leafMat,32);
  drifting.frustumCulled=false;scene.add(drifting);
  const leaves=Array.from({length:drifting.count},(_,i)=>{
    const t=trees[i%4];drifting.setColorAt(i,palette.setHex(leafColors[i%5]));
    return {x:t[0]+between(-2,2),z:t[1]+between(-2,2),y:between(5,8.4),phase:rand(),rate:between(.05,.102),a:rand()*tau};
  });
  return {addTree,update(time,mood){
    clock.value=time;drifting.visible=mood!=='night';
    if(!drifting.visible)return;
    leaves.forEach((l,i)=>{
      const f=(l.phase+l.rate*time)%1, w=f*tau+l.a;
      transform.position.set(l.x+2.8*f+.62*Math.sin(w),.08+(1-f)*l.y,l.z+.55*Math.cos(w*1.4)+.5*f);
      transform.rotation.set(w*2.8,l.a+time*.44,Math.sin(w*2)*.9,'YXZ');
      transform.scale.setScalar(Math.min(1,(1-f)*17,f*17));transform.updateMatrix();
      drifting.setMatrixAt(i,transform.matrix);
    });
    drifting.instanceMatrix.needsUpdate=true;
  }};
}

// Camera-facing strips keep three distinct incense threads continuous even at close range.
function buildIncenseSmoke(scene) {
  const uv=[],indices=[],position=[];
  for(let lane=0;lane<3;lane++){
    for(let row=0;row<=44;row++){
      for(let side=0;side<2;side++){
        uv.push(side,row/44);
        position.push((lane-1)*.23,2.74,2.2+[.32,-.18,.26][lane]);
      }
      if(row){
        const k=lane*90+row*2;
        indices.push(k-2,k-1,k,k-1,k+1,k);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);
  const uniforms={uTime:{value:0},uOffer:{value:0},uTint:{value:new THREE.Color()}};
  const material=new THREE.ShaderMaterial({
    uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`
      uniform float uTime, uOffer;
      varying vec2 coord;
      void main(){
        coord=uv; float h=uv.y, phase=position.x*12.;
        vec3 p=position;
        p.y+=h*(2.85+.55*uOffer);
        p.x+=h*h*.86 + sin(h*7.3-uTime*.76+phase)*(.024+h*.17);
        p.z+=cos(h*6.5-uTime*.54+phase)*h*.24;
        vec4 eye=modelViewMatrix*vec4(p,1.);
        eye.x+=(uv.x-.5)*(.032+pow(h,1.28)*.59);
        gl_Position=projectionMatrix*eye;
      }`,
    fragmentShader:`
      uniform float uTime,uOffer; uniform vec3 uTint; varying vec2 coord;
      void main(){
        float h=coord.y;
        float edge=abs(coord.x-.5)*2.;
        float core=exp(-5.*edge*edge);
        float breakup=.68+.32*sin(h*18.-uTime*1.15);
        float fade=smoothstep(0.,.06,h)*(1.-smoothstep(.35,1.,h));
        gl_FragColor=vec4(uTint,core*fade*breakup*(.45+uOffer*.22));
        #include <encodings_fragment>
      }`
  });
  const plume=new THREE.Mesh(geometry,material);plume.frustumCulled=false;scene.add(plume);
  return (time,offering,night)=>{
    uniforms.uTime.value=time;
    uniforms.uOffer.value=THREE.MathUtils.damp(uniforms.uOffer.value,offering?1:0,3,Math.max(0,time-(plume.userData.time||time)));
    plume.userData.time=time;
    uniforms.uTint.value.setHex(night?0xcac8ba:0xb9bfc1);
  };
}
