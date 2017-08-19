const sin_f = (amplitude, phase, width, offset_x, offset_y, slow_down) =>
  t => new THREE.Vector3(
    t * width - offset_x,
    Math.sin(t ** slow_down + phase) * amplitude - offset_y,
    Math.sin(t ** slow_down / 3) * amplitude
  );

const sine = (amplitude, phase, width, offset_x, offset_y, slow_down) =>
  arange(0, Math.PI * 4, 0.05)
  .map(sin_f(amplitude, phase, width, offset_x, offset_y, slow_down));

const CURVE_RES = 100;

const createCurveGeometry = curvePoints => {
  const curve = new THREE.CatmullRomCurve3(curvePoints);
  curve.closed = false;

  const path = new THREE.CurvePath();
  path.add(curve);
  path.autoclose = false;

  const geometry = path.createPointsGeometry(CURVE_RES);

  return geometry.type === 'BufferGeometry'
    ? new THREE.Geometry().fromBufferGeometry(geometry)
    : geometry;
}

const createCurve = material => curvePoints => {
  const geometry = createCurveGeometry(curvePoints);

  const line = new MeshLine();
  line.setGeometry(geometry, p => 0.8 + 0.8 * Math.sin(p));

  return new THREE.Mesh(line.geometry, material);
};

const material = new MeshLineMaterial({
  useMap: 0,
  lineWidth: 0.2,
  color: new THREE.Color(0xF2A534)
});

const curves = [
  sine(2, 0.8, 6, 20, 0, 1.3),
  sine(2, 0.8, 6, 20, 5, 1.05)
];

const createBridgesGeometry = (curves, i) => {
  const geometry = new THREE.Geometry();

  const middle = new THREE.Vector3(
    THREE.Math.lerp(curves[0][i].x, curves[1][i].x, 0.5),
    THREE.Math.lerp(curves[0][i].y, curves[1][i].y, 0.5),
    THREE.Math.lerp(curves[0][i].z, curves[1][i].z, 0.5),
  );

  geometry.vertices.push(curves[0][i].clone());
  geometry.vertices.push(middle);
  geometry.vertices.push(curves[1][i].clone());

  return geometry;
}

const bridges = curves[0]
  .map((p, i, a) => {
    if (i === 0 || i >= a.length - 1) return null;

    const geometry = createBridgesGeometry(curves, i);

    const line = new MeshLine();
    line.setGeometry(geometry, p => 0.3 + !((p * 2) % 2) * 0.5);

    return new THREE.Mesh(line.geometry, material);
  });

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 100);
const controls = new OrbitControls(camera);

const scene = new THREE.Scene();
const object = new THREE.Group();

const curveObjects = curves.map(createCurve(material)).map(c => { object.add(c); return c; });

const bridgeObjects = bridges.map(b => {
  if (b) {
    object.add(b);
    return b;
  }
  else {
    return null;
  };
});

scene.add(object);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// setInterval(() => {
//   const newCurves = [
//     sine(Math.random * 3, Math.random * Math.PI, 6, 20, 0, 1 + Math.random * 0.3),
//     sine(Math.random * 3, Math.random * Math.PI, 6, 20, 5, 1 + Math.random * 0.3)
//   ];

//   curveObjects.forEach((co, i) => {
//     const newGeometry = createCurveGeometry(newCurves[i]);
//     console.log(co.geometry.type, newGeometry.type);
//     co.geometry.copy(newGeometry);
//     co.geometry.verticesNeedUpdate = true;
//   });
// }, 2000);

const render = () => {
  requestAnimationFrame(render);
  renderer.render(scene, camera);

  // object.rotation.z += 0.01;
  // object.rotation.x += 0.01;
  // object.rotation.y += 0.001;
}
render();
