// curve? https://stackoverflow.com/questions/51596272/warp-curve-all-vertices-around-a-pivot-point-axis-three-js-glsl

var renderer, stats, scene, camera;

init();
animate();

//



function init() {
  var container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 200);


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);


  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;

  window.addEventListener("resize", onWindowResize, false);

  guiData = {
    drawFillShapes: true,
    drawStrokes: true,
    fillShapesWireframe: false,
    strokesWireframe: false
  };

  loadSVG("cuff.svg");
}

function twist(geometry) {
  geometry.computeBoundingBox()
  const width = 
    geometry.boundingBox.max.x -
    geometry.boundingBox.min.x;

  for (let i = 0; i < geometry.vertices.length; i++) {
    const xPos = geometry.vertices[i].x;
    const percent = xPos / width;
    
    geometry.vertices[i].z = Math.pow(Math.sin(percent * Math.PI), 2) + geometry.vertices[i].z;
  }
  
  // tells Three.js to re-render this mesh
  geometry.verticesNeedUpdate = true;
}

function fuckWithCurves(curves) {
  const newCurves = [];

  curves.forEach((curve) => {
    console.log(curve);
    console.log(curve.constructor.name);
    if (curve.constructor.name == 'LineCurve') {
      const startX = curve.v1.x;
      const startY = curve.v1.y;
      const endX = curve.v2.x;
      const endY = curve.v2.y;

      console.log(startX, startY, endX, endY)

      const NumPoints = 100;

      for (let i = 0; i < NumPoints -1 ; i++) {
        const c =
          new THREE.LineCurve(
            new THREE.Vector2(
              startX + ((endX - startX) * (i/NumPoints)),
              startY + ((endY - startY) * (i/NumPoints))
            ),
            new THREE.Vector2(
              startX + ((endX - startX) * ((i+1)/NumPoints)),
              startY + ((endY - startY) * ((i+1)/NumPoints))
            )
          );
        console.log(c);
        newCurves.push(c);
      }
    } else {
      newCurves.push(curve);
    }
  })
  
  return newCurves;
}

function loadSVG(url) {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb0b0b0);


  var helper = new THREE.GridHelper(160, 10);
  helper.rotation.x = Math.PI / 2;
  scene.add(helper);

  //

  var loader = new THREE.SVGLoader();

  loader.load(url, function(data) {
    var paths = data.paths;

    var group = new THREE.Group();
    group.scale.multiplyScalar(20.25);
    // group.position.x = - 70;
    // group.position.y = 70;
    group.scale.y *= -1;


    const leather = new THREE.ImageUtils.loadTexture("texture.jpg");
    leather.wrapS = leather.wrapT = THREE.RepeatWrapping;
    var uniformsL = {
      leatherImage: { type: "t", value: leather }
    };

    var vs = document.getElementById("vertexShader").textContent;
    var fsL = document.getElementById("fragmentShader-L").textContent;

    var material = new THREE.ShaderMaterial({
      uniforms: uniformsL,
      shading: THREE.FlatShading,
      side: THREE.DoubleSide,
      vertexShader: vs,
      fragmentShader: fsL
    });

    const bend = new Bend(0.4, 0.2, 0);
    bend.constraint = ModConstant.LEFT;

    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      console.log(path);

      // console.log(path);

      if (guiData.drawFillShapes) {
        // var material = new THREE.MeshPhongMaterial({ color: 0x7777ff });

        material = new THREE.MeshBasicMaterial( {
          color: new THREE.Color().setStyle( {color: 0x7777ff}),
          opacity: path.userData.style.fillOpacity,
          transparent: path.userData.style.fillOpacity < 1,
          side: THREE.SingleSide,
          depthWrite: false,
          wireframe: true,
        } );

        var shapes = path.toShapes(false);

        for (var j = 0; j < shapes.length; j++) {
          
          var shape = shapes[j];
          console.log(shape);
          shape.holes = [];

          shape.curves = fuckWithCurves(shape.curves);

          var geometry = new THREE.ShapeGeometry( shape );


          const depth = 0.3;

          // var geometry = new THREE.ExtrudeGeometry(shape, {
          //   depth: depth,
          //   bevelEnabled: false
          // });

          twist(geometry);

          var mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.x = Math.PI;
          // mesh.translateZ(-depth - 1);


          const center = new THREE.Vector3();
          mesh.geometry.computeBoundingBox();
          mesh.geometry.boundingBox.getCenter( center );
          
          mesh.translateX( - center.x );
          mesh.translateY( - center.y );

          group.add(mesh);
        }
      }
    }

    scene.add(group);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.render(scene, camera);
}
