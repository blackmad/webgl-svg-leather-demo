var renderer, stats, scene, camera;

init();
animate();

//

function init() {
  var container = document.getElementById("container");

  //

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 200);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;

  //

  //

  window.addEventListener("resize", onWindowResize, false);

  guiData = {
    drawFillShapes: true,
    drawStrokes: true,
    fillShapesWireframe: false,
    strokesWireframe: false
  };

  loadSVG("/cuff.svg");
}

function loadSVG(url) {
  //

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb0b0b0);

  //

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

    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];

      if (guiData.drawFillShapes) {
        // var material = new THREE.MeshPhongMaterial({ color: 0x7777ff });

        // var material = new THREE.MeshBasicMaterial( {
        //   color: new THREE.Color().setStyle( fillColor ),
        //   opacity: path.userData.style.fillOpacity,
        //   transparent: path.userData.style.fillOpacity < 1,
        //   side: THREE.DoubleSide,
        //   depthWrite: false,
        //   wireframe: guiData.fillShapesWireframe
        // } );

        var shapes = path.toShapes(false);

        for (var j = 0; j < shapes.length; j++) {
          var shape = shapes[j];

          // var geometry = new THREE.ShapeBufferGeometry( shape );
          // var mesh = new THREE.Mesh( geometry, material );

          const depth = 0.1;

          var shape3d = new THREE.ExtrudeBufferGeometry(shape, {
            depth: depth,
            bevelEnabled: false
          });

          var mesh = new THREE.Mesh(shape3d, material);
          mesh.rotation.x = Math.PI;
          mesh.translateZ(-depth - 1);


          const center = new THREE.Vector3();
          mesh.geometry.computeBoundingBox();
          mesh.geometry.boundingBox.getCenter( center );
          
          mesh.translateX( - center.x );
          mesh.translateY( - center.y );

          console.log(shape);
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
