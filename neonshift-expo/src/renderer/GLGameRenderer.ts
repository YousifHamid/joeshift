import { ExpoWebGLRenderingContext } from 'expo-gl';
import { GameConfig } from '../game/GameConfig';
import { GameUiState } from '../game/GameUiState';
import { PowerUpType } from '../game/PowerUp';
import { DEFAULT_SKIN_ID, VEHICLE_SKINS } from '../game/VehicleSkins';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: [number, number, number, number];
  size: number;
}

export class GLGameRenderer {
  private gl: ExpoWebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;

  private uResolutionLoc: WebGLUniformLocation | null = null;
  private aPositionLoc: number = -1;
  private aColorLoc: number = -1;

  private positions: number[] = [];
  private colors: number[] = [];

  private linePositions: number[] = [];
  private lineColors: number[] = [];

  private particles: Particle[] = [];
  private runTime: number = 0;
  private scrollOffset: number = 0;
  private screenWidth: number = 400;
  private screenHeight: number = 800;

  public init(gl: ExpoWebGLRenderingContext): void {
    this.gl = gl;

    const vsSource = `
      attribute vec2 a_position;
      attribute vec4 a_color;
      uniform vec2 u_resolution;
      varying vec4 v_color;
      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
        v_color = a_color;
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return;
    }

    this.program = prog;
    this.uResolutionLoc = gl.getUniformLocation(prog, 'u_resolution');
    this.aPositionLoc = gl.getAttribLocation(prog, 'a_position');
    this.aColorLoc = gl.getAttribLocation(prog, 'a_color');

    this.positionBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public render(state: GameUiState, width: number, height: number, dt: number): void {
    const gl = this.gl;
    if (!gl || !this.program) return;

    this.runTime += dt;
    this.scrollOffset = (this.scrollOffset + state.speed * dt * 2.5) % 10;

    gl.viewport(0, 0, width, height);
    // Dark cyberpunk void background
    gl.clearColor(0.024, 0.024, 0.059, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.uniform2f(this.uResolutionLoc, width, height);

    this.positions = [];
    this.colors = [];
    this.linePositions = [];
    this.lineColors = [];
    this.screenWidth = width;
    this.screenHeight = height;

    const horizonY = height * 0.35;
    const vanishX = width / 2;
    const laneHalfSpreadNear = width * 0.44;

    const project = (worldX: number, z: number): { x: number; y: number } => {
      const depthT = Math.max(0, Math.min(1, 1 - z / 60));
      const screenY = horizonY + (height - horizonY) * depthT;
      const spread = laneHalfSpreadNear * depthT + 6 * (1 - depthT);
      const screenX = vanishX + (worldX / 3.3) * spread;
      return { x: screenX, y: screenY };
    };

    // 1. Draw Background Horizon Cyber Sun & Distant Glow
    this.drawHorizonBackdrop(vanishX, horizonY, width, height, state);

    // 2. Draw Floor Track & Grid lines
    this.drawTrackGrid(project, horizonY, width, height, state);

    // 3. Draw Void Gaps (drawn directly on track floor before other objects)
    this.drawVoidGaps(state, project);

    // 4. Draw Obstacles (sorted back to front)
    this.drawObstacles(state, project);

    // 5. Draw Collectibles (Energy Shards)
    this.drawShards(state, project);

    // 6. Draw Power-Up Orbs
    this.drawPowerUps(state, project);

    // 7. Draw Blaster Projectiles
    this.drawProjectiles(state, project);

    // 8. Draw Player Speeder / Runner (with perspective vanishing point alignment)
    this.drawPlayer(state, project, dt, vanishX, horizonY);

    // 9. Draw Active Thruster & Collection Particles
    this.updateAndDrawParticles(dt);

    // Flush batch to GPU
    this.flush(gl);

    gl.endFrameEXP();
  }

  private drawHorizonBackdrop(vanishX: number, horizonY: number, width: number, height: number, state: GameUiState): void {
    // Upper neon night sky gradient
    const skyColorTop: [number, number, number, number] = [0.02, 0.02, 0.06, 1.0];
    const skyColorBot: [number, number, number, number] = state.gridShiftWarning
      ? [0.35, 0.05, 0.15, 1.0]
      : [0.08, 0.03, 0.22, 1.0];
    this.addQuad(0, 0, width, horizonY, skyColorTop, skyColorBot);

    // Distant Cyber City Skyline Towers flanking the track (as seen in AAA cyber runners)
    const towerColors: [number, number, number, number][] = [
      [0.0, 0.96, 1.0, 0.45], // Electric Cyan
      [1.0, 0.0, 0.75, 0.45], // Neon Magenta
      [0.48, 0.18, 1.0, 0.45], // Cyber Violet
    ];
    for (let i = 0; i < 14; i++) {
      const isLeft = i < 7;
      const idx = isLeft ? i : i - 7;
      const tw = width * (0.045 + (idx % 3) * 0.02);
      const th = horizonY * (0.35 + ((idx * 7) % 5) * 0.12);
      const tx = isLeft
        ? (idx * width * 0.07)
        : width - (idx + 1) * width * 0.07;
      const ty = horizonY - th;

      // Silhouetted tower block
      this.addQuad(tx, ty, tw, th, [0.04, 0.05, 0.12, 0.92], [0.08, 0.06, 0.2, 0.92]);
      // Glowing neon spire and window strips
      const c = towerColors[idx % towerColors.length];
      this.addLine(tx + tw / 2, ty, tx + tw / 2, ty - 14, c, c);
      for (let w = 0; w < 3; w++) {
        const winY = ty + 10 + w * (th * 0.26);
        this.addLine(tx + 4, winY, tx + tw - 4, winY, c, c);
      }
    }

    // Distant Synthwave Sun
    const sunRadius = width * 0.16;
    const sunY = horizonY - sunRadius * 0.22;
    const sunColorCenter: [number, number, number, number] = [1.0, 0.0, 0.85, 0.9];
    const sunColorOuter: [number, number, number, number] = [0.48, 0.18, 1.0, 0.3];
    this.addCircle(vanishX, sunY, sunRadius, sunColorCenter, sunColorOuter, 28);

    // Horizon line with glowing bloom
    const horizonColor: [number, number, number, number] = state.gridShiftWarning
      ? [1.0, 0.16, 0.4, 0.9]
      : [0.0, 0.96, 1.0, 0.85];
    this.addLine(0, horizonY, width, horizonY, horizonColor, horizonColor);
  }

  private drawTrackGrid(
    project: (worldX: number, z: number) => { x: number; y: number },
    horizonY: number,
    width: number,
    height: number,
    state: GameUiState
  ): void {
    // Shifting grid lateral offset
    const shiftOffset = state.isGridShifting ? Math.sin(this.runTime * 18) * 0.35 : 0;

    // 1. Sleek Reflective Dark Wet Highway Bed (as seen in reference art)
    const roadNearL = project(-4.6, 0);
    const roadNearR = project(4.6, 0);
    const roadFarL = project(-4.6 + shiftOffset, 60);
    const roadFarR = project(4.6 + shiftOffset, 60);
    const roadBedColorTop: [number, number, number, number] = [0.03, 0.03, 0.07, 0.98];
    const roadBedColorBot: [number, number, number, number] = [0.07, 0.08, 0.15, 0.98];
    this.addPolygon([roadFarL, roadFarR, roadNearR, roadNearL], roadBedColorBot);

    // 2. High-Intensity Electric Cyan Lane Guide Laser Rails (Reference Art Style!)
    const coreLineColor: [number, number, number, number] = state.gridShiftWarning
      ? [1.0, 0.16, 0.4, 0.95]
      : [0.0, 0.96, 1.0, 0.98];
    const bloomLineColor: [number, number, number, number] = state.gridShiftWarning
      ? [1.0, 0.0, 0.35, 0.4]
      : [0.0, 0.75, 1.0, 0.45];

    // Longitudinal Lane boundaries (4 boundaries for 3 lanes)
    for (let lane = -1.5; lane <= 1.5; lane += 1.0) {
      const far = project(lane * 2.2 + shiftOffset, 60);
      const near = project(lane * 2.2, 0);
      // Soft ambient blue bloom beneath laser
      this.addLine(far.x - 2, far.y, near.x - 3, near.y, bloomLineColor, bloomLineColor);
      this.addLine(far.x + 2, far.y, near.x + 3, near.y, bloomLineColor, bloomLineColor);
      // Brilliant core laser beam
      this.addLine(far.x, far.y, near.x, near.y, coreLineColor, coreLineColor);
    }

    // Outer Neon Speed Rails
    const leftFarRail = project(-4.3 + shiftOffset, 60);
    const leftNearRail = project(-4.3, 0);
    const rightFarRail = project(4.3 + shiftOffset, 60);
    const rightNearRail = project(4.3, 0);
    const railColor: [number, number, number, number] = [0.0, 0.96, 1.0, 0.95];
    this.addLine(leftFarRail.x, leftFarRail.y, leftNearRail.x, leftNearRail.y, railColor, railColor);
    this.addLine(rightFarRail.x, rightFarRail.y, rightNearRail.x, rightNearRail.y, railColor, railColor);

    // Transverse speed lines for high-speed parallax flow
    const crossColor: [number, number, number, number] = [0.0, 0.85, 1.0, 0.28];
    for (let i = 0; i < 8; i++) {
      let z = i * 8.0 - this.scrollOffset;
      if (z < 0) z += 60;
      if (z > 60) continue;

      const pLeft = project(-4.3, z);
      const pRight = project(4.3, z);
      this.addLine(pLeft.x, pLeft.y, pRight.x, pRight.y, crossColor, crossColor);
    }
  }

  private drawVoidGaps(
    state: GameUiState,
    project: (worldX: number, z: number) => { x: number; y: number }
  ): void {
    for (const obs of state.obstacleSnapshot) {
      if (obs.type !== 'VOID_GAP') continue;
      const worldX = (obs.lane - 1) * 2.2;
      const depthT = Math.max(0.08, Math.min(1, 1 - obs.z / 60));

      const pFrontLeft = project(worldX - 1.0, Math.max(0, obs.z - 0.7));
      const pFrontRight = project(worldX + 1.0, Math.max(0, obs.z - 0.7));
      const pBackLeft = project(worldX - 1.0, obs.z + 0.7);
      const pBackRight = project(worldX + 1.0, obs.z + 0.7);

      // Deep void black hole
      const voidColor: [number, number, number, number] = [0.0, 0.0, 0.02, 0.95];
      this.addPolygon([pFrontLeft, pFrontRight, pBackRight, pBackLeft], voidColor);

      // Pulsing glowing edge
      const edgeColor: [number, number, number, number] = [1.0, 0.0, 0.35, 0.9 * depthT];
      this.addLine(pFrontLeft.x, pFrontLeft.y, pFrontRight.x, pFrontRight.y, edgeColor, edgeColor);
      this.addLine(pBackLeft.x, pBackLeft.y, pBackRight.x, pBackRight.y, edgeColor, edgeColor);
      this.addLine(pFrontLeft.x, pFrontLeft.y, pBackLeft.x, pBackLeft.y, edgeColor, edgeColor);
      this.addLine(pFrontRight.x, pFrontRight.y, pBackRight.x, pBackRight.y, edgeColor, edgeColor);
    }
  }

  private drawObstacles(
    state: GameUiState,
    project: (worldX: number, z: number) => { x: number; y: number }
  ): void {
    const sorted = [...state.obstacleSnapshot].sort((a, b) => b.z - a.z);

    for (const o of sorted) {
      if (o.type === 'VOID_GAP') continue;
      const worldX = (o.lane - 1) * 2.2;
      const p = project(worldX, o.z);
      const depthT = Math.max(0.08, Math.min(1, 1 - o.z / 60));

      if (o.type === 'HORIZONTAL_LASER') {
        // High-energy 3D laser barrier with glowing twin emitter pylons
        const pLeft = project(worldX - 1.1, o.z);
        const pRight = project(worldX + 1.1, o.z);
        const laserElevation = 28 * depthT;

        // Ground reflection glow under laser
        const groundGlow: [number, number, number, number] = [1.0, 0.05, 0.4, 0.3 * depthT];
        this.addCircle((pLeft.x + pRight.x) / 2, pLeft.y, (pRight.x - pLeft.x) * 0.45, groundGlow, [0, 0, 0, 0], 12);

        // 3D Emitter Pylons on left and right rails
        const pylonW = 8 * depthT;
        const pylonH = 36 * depthT;
        const pylonColor: [number, number, number, number] = [0.15, 0.15, 0.28, 0.95];
        const pylonGlow: [number, number, number, number] = [1.0, 0.1, 0.45, 0.9];
        // Left pylon
        this.addQuad(pLeft.x - pylonW / 2, pLeft.y - pylonH, pylonW, pylonH, pylonColor, pylonColor);
        this.addCircle(pLeft.x, pLeft.y - laserElevation, 5.5 * depthT, [1, 1, 1, 1], pylonGlow, 8);
        // Right pylon
        this.addQuad(pRight.x - pylonW / 2, pRight.y - pylonH, pylonW, pylonH, pylonColor, pylonColor);
        this.addCircle(pRight.x, pRight.y - laserElevation, 5.5 * depthT, [1, 1, 1, 1], pylonGlow, 8);

        // Oscillating high-voltage laser core
        const waveOffset = Math.sin(this.runTime * 24 + o.lane) * 2.5 * depthT;
        const beamGlowColor: [number, number, number, number] = [1.0, 0.1, 0.45, 0.5 * depthT];
        const beamCoreColor: [number, number, number, number] = [1.0, 0.92, 0.98, 1.0];

        // Volumetric beam glow
        this.addQuad(
          pLeft.x,
          pLeft.y - laserElevation - 8 * depthT,
          pRight.x - pLeft.x,
          16 * depthT,
          beamGlowColor,
          beamGlowColor
        );
        // Core laser beam
        this.addLine(
          pLeft.x,
          pLeft.y - laserElevation,
          pRight.x,
          pRight.y - laserElevation,
          beamCoreColor,
          beamCoreColor
        );
        // Electric arc discharge
        this.addLine(
          pLeft.x,
          pLeft.y - laserElevation + waveOffset,
          pRight.x,
          pRight.y - laserElevation - waveOffset,
          [0.0, 0.96, 1.0, 0.85],
          [1.0, 0.16, 0.4, 0.85]
        );
      } else {
        // GROUND_BARRIER: True 3D Isometric Cyber Barrier Block (Reference Art Style!)
        const depthZ = 1.3;
        const pFront = p;
        const pBack = project(worldX, o.z + depthZ);
        const backDepthT = Math.max(0.06, Math.min(1, 1 - (o.z + depthZ) / 60));

        const wFront = 58 * depthT;
        const hFront = 48 * depthT;
        const wBack = 58 * backDepthT;
        const hBack = 48 * backDepthT;

        // Front 4 corners
        const FL = { x: pFront.x - wFront / 2, y: pFront.y };
        const FR = { x: pFront.x + wFront / 2, y: pFront.y };
        const TL = { x: pFront.x - wFront / 2, y: pFront.y - hFront };
        const TR = { x: pFront.x + wFront / 2, y: pFront.y - hFront };

        // Back 4 corners
        const B_FL = { x: pBack.x - wBack / 2, y: pBack.y };
        const B_FR = { x: pBack.x + wBack / 2, y: pBack.y };
        const B_TL = { x: pBack.x - wBack / 2, y: pBack.y - hBack };
        const B_TR = { x: pBack.x + wBack / 2, y: pBack.y - hBack };

        // 1. Ambient Floor Glow under box (intense red neon puddle on wet tarmac)
        const floorGlowColor: [number, number, number, number] = [1.0, 0.05, 0.25, 0.5 * depthT];
        this.addCircle(pFront.x, pFront.y, wFront * 0.75, floorGlowColor, [0, 0, 0, 0], 14);

        // 2. Thick Glowing Neon Red Pedestal Collar hugging the road (from reference art)
        const collarH = 7 * depthT;
        const collarColor: [number, number, number, number] = [1.0, 0.05, 0.25, 0.98 * depthT];
        this.addQuad(
          FL.x - 3 * depthT,
          FL.y - collarH,
          wFront + 6 * depthT,
          collarH + 2 * depthT,
          collarColor,
          collarColor
        );

        // 3. 3D Side Face (perspective based on camera angle from center)
        if (worldX > 0.2) {
          // Left side face visible
          const sideColor: [number, number, number, number] = [0.45, 0.04, 0.15, 0.95 * depthT];
          this.addPolygon([FL, TL, B_TL, B_FL], sideColor);
          const sideEdge: [number, number, number, number] = [1.0, 0.18, 0.4, 0.85 * depthT];
          this.addLine(FL.x, FL.y, B_FL.x, B_FL.y, sideEdge, sideEdge);
          this.addLine(TL.x, TL.y, B_TL.x, B_TL.y, sideEdge, sideEdge);
        } else if (worldX < -0.2) {
          // Right side face visible
          const sideColor: [number, number, number, number] = [0.45, 0.04, 0.15, 0.95 * depthT];
          this.addPolygon([FR, TR, B_TR, B_FR], sideColor);
          const sideEdge: [number, number, number, number] = [1.0, 0.18, 0.4, 0.85 * depthT];
          this.addLine(FR.x, FR.y, B_FR.x, B_FR.y, sideEdge, sideEdge);
          this.addLine(TR.x, TR.y, B_TR.x, B_TR.y, sideEdge, sideEdge);
        }

        // 4. 3D Top Roof Plate (glossy specular beveled facet catching light)
        const topColor: [number, number, number, number] = [0.85, 0.18, 0.35, 0.95 * depthT];
        this.addPolygon([TL, TR, B_TR, B_TL], topColor);
        const topHighlight: [number, number, number, number] = [1.0, 0.6, 0.75, 0.95 * depthT];
        this.addLine(TL.x, TL.y, TR.x, TR.y, topHighlight, topHighlight);
        this.addLine(B_TL.x, B_TL.y, B_TR.x, B_TR.y, topHighlight, topHighlight);
        this.addLine(TL.x, TL.y, B_TL.x, B_TL.y, topHighlight, topHighlight);
        this.addLine(TR.x, TR.y, B_TR.x, B_TR.y, topHighlight, topHighlight);

        // 5. 3D Front Face with Bold Diagonal Hazard Warning Stripes (/// Pattern from Reference Art!)
        const darkRedBase: [number, number, number, number] = [0.35, 0.03, 0.08, 0.98 * depthT];
        this.addPolygon([FL, FR, TR, TL], darkRedBase);

        // Render 3 diagonal bright neon red hazard stripe bars across the face
        const brightStripeColor: [number, number, number, number] = [1.0, 0.15, 0.28, 1.0 * depthT];
        const stripeWidth = wFront * 0.28;
        for (let sIdx = -1; sIdx <= 2; sIdx++) {
          const sOffset = sIdx * (wFront * 0.42);
          const p1 = { x: FL.x + sOffset, y: FL.y - collarH };
          const p2 = { x: FL.x + sOffset + stripeWidth, y: FL.y - collarH };
          const p3 = { x: TL.x + sOffset + stripeWidth + hFront * 0.45, y: TL.y };
          const p4 = { x: TL.x + sOffset + hFront * 0.45, y: TL.y };

          // Clamp polygon to front face boundaries
          this.addPolygon([p1, p2, p3, p4], brightStripeColor);
        }

        // Glowing outer neon perimeter frame
        const frameColor: [number, number, number, number] = [1.0, 0.2, 0.45, 0.95 * depthT];
        this.addLine(FL.x, FL.y - collarH, FR.x, FR.y - collarH, frameColor, frameColor);
        this.addLine(FR.x, FR.y - collarH, TR.x, TR.y, frameColor, frameColor);
        this.addLine(TR.x, TR.y, TL.x, TL.y, frameColor, frameColor);
        this.addLine(TL.x, TL.y, FL.x, FL.y - collarH, frameColor, frameColor);

        // Corner Warning Beacons
        const beaconColor: [number, number, number, number] = [1.0, 0.2, 0.4, 0.95 * depthT];
        this.addCircle(TL.x, TL.y, 4 * depthT, [1, 1, 1, 1], beaconColor, 6);
        this.addCircle(TR.x, TR.y, 4 * depthT, [1, 1, 1, 1], beaconColor, 6);
      }
    }
  }

  private drawShards(
    state: GameUiState,
    project: (worldX: number, z: number) => { x: number; y: number }
  ): void {
    const sorted = [...state.shardSnapshot].sort((a, b) => b.z - a.z);

    for (const s of sorted) {
      const worldX = (s.lane - 1) * 2.2;
      const p = project(worldX, s.z);
      const depthT = Math.max(0.08, Math.min(1, 1 - s.z / 60));

      const hover = Math.sin(this.runTime * 5 + s.lane) * 3 * depthT;
      const coinY = p.y - 18 * depthT + hover;
      const radius = 15 * depthT;

      // 3D Coin Spin Effect: oscillates width based on rotation (Reference Art Gold Coins!)
      const spinAngle = this.runTime * 4.2 + s.lane * 1.5;
      const spinCos = Math.cos(spinAngle);
      const coinHalfW = Math.max(radius * 0.28, radius * Math.abs(spinCos));
      const coinH = radius;

      // 1. Ambient Golden Ground Reflection Glow on Road
      const groundGlowColor: [number, number, number, number] = [1.0, 0.8, 0.05, 0.35 * depthT];
      this.addCircle(p.x, p.y + 2, radius * 1.4, groundGlowColor, [0, 0, 0, 0], 14);

      // 2. Outer Radiant Energy Halo
      const haloColor: [number, number, number, number] = [1.0, 0.75, 0.0, 0.4 * depthT];
      this.addCircle(p.x, coinY, radius * 1.35, haloColor, [0, 0, 0, 0], 16);

      // 3. 3D Raised Golden Rim & Face
      const rimColor: [number, number, number, number] = [1.0, 0.88, 0.1, 0.98 * depthT];
      const faceColor: [number, number, number, number] = [0.95, 0.65, 0.02, 0.98 * depthT];
      this.addPolygon([
        { x: p.x - coinHalfW, y: coinY - coinH * 0.75 },
        { x: p.x + coinHalfW, y: coinY - coinH * 0.75 },
        { x: p.x + coinHalfW, y: coinY + coinH * 0.75 },
        { x: p.x - coinHalfW, y: coinY + coinH * 0.75 },
      ], faceColor);

      // Raised Rim Outline
      this.addLine(p.x - coinHalfW, coinY - coinH * 0.75, p.x + coinHalfW, coinY - coinH * 0.75, rimColor, rimColor);
      this.addLine(p.x + coinHalfW, coinY - coinH * 0.75, p.x + coinHalfW, coinY + coinH * 0.75, rimColor, rimColor);
      this.addLine(p.x + coinHalfW, coinY + coinH * 0.75, p.x - coinHalfW, coinY + coinH * 0.75, rimColor, rimColor);
      this.addLine(p.x - coinHalfW, coinY + coinH * 0.75, p.x - coinHalfW, coinY - coinH * 0.75, rimColor, rimColor);

      // 4. Inlaid Cyber Star / Crest & Specular Glint
      if (Math.abs(spinCos) > 0.45) {
        const innerHalfW = coinHalfW * 0.55;
        const innerH = coinH * 0.45;
        const crestColor: [number, number, number, number] = [1.0, 0.98, 0.6, 0.95 * depthT];
        this.addPolygon([
          { x: p.x, y: coinY - innerH },
          { x: p.x + innerHalfW, y: coinY },
          { x: p.x, y: coinY + innerH },
          { x: p.x - innerHalfW, y: coinY },
        ], crestColor);

        // Brilliant White Specular Glint on Upper Rim
        this.addCircle(p.x - innerHalfW * 0.5, coinY - innerH * 0.6, 2.5 * depthT, [1, 1, 1, 1], rimColor, 6);
      }
    }
  }

  private drawPowerUps(
    state: GameUiState,
    project: (worldX: number, z: number) => { x: number; y: number }
  ): void {
    for (const pu of state.powerUpSnapshot) {
      const worldX = (pu.lane - 1) * 2.2;
      const p = project(worldX, pu.z);
      const depthT = Math.max(0.08, Math.min(1, 1 - pu.z / 60));

      const hover = Math.sin(this.runTime * 5 + pu.lane) * 6 * depthT;
      const puY = p.y - 26 * depthT + hover;
      // Enlarged luminous cyber pearl radius!
      const radius = 26 * depthT;

      let orbColor: [number, number, number, number] = [1.0, 0.0, 0.9, 0.95];
      let auraColor: [number, number, number, number] = [1.0, 0.0, 0.9, 0.35];
      let ringColor: [number, number, number, number] = [1.0, 0.6, 0.95, 0.9];

      if (pu.type === PowerUpType.PHASE_SHIELD) {
        orbColor = [0.0, 0.96, 1.0, 0.95];
        auraColor = [0.0, 0.96, 1.0, 0.35];
        ringColor = [0.6, 1.0, 1.0, 0.9];
      } else if (pu.type === PowerUpType.CHRONO_WARP) {
        orbColor = [0.6, 0.25, 1.0, 0.95];
        auraColor = [0.48, 0.18, 1.0, 0.35];
        ringColor = [0.85, 0.6, 1.0, 0.9];
      } else if (pu.type === PowerUpType.OVERDRIVE) {
        // Glowing Golden Overdrive Pearl!
        orbColor = [1.0, 0.85, 0.0, 0.98];
        auraColor = [1.0, 0.8, 0.0, 0.38];
        ringColor = [1.0, 0.98, 0.5, 0.95];
      } else if (pu.type === PowerUpType.ENERGY_MAGNET) {
        // Glowing Emerald Magnet Pearl!
        orbColor = [0.0, 1.0, 0.45, 0.98];
        auraColor = [0.0, 1.0, 0.4, 0.38];
        ringColor = [0.6, 1.0, 0.8, 0.95];
      }

      // 1. Shimmering outer energy aura halo
      this.addCircle(p.x, puY, radius * 1.55, auraColor, [0, 0, 0, 0], 22);

      // 2. Rotating orbital pearl halo ring
      this.addCircleOutline(p.x, puY, radius * 1.25, ringColor, 20);

      // 3. Lustrous Cyber Pearl spherical shell
      this.addCircle(p.x, puY, radius, orbColor, orbColor, 22);

      // 4. Inner radiant pearlescent specular core & highlight bead
      this.addCircle(p.x, puY, radius * 0.48, [1, 1, 1, 0.95], orbColor, 16);
      this.addCircle(p.x - radius * 0.3, puY - radius * 0.3, radius * 0.24, [1, 1, 1, 1.0], [1, 1, 1, 0.7], 10);
    }
  }

  private drawProjectiles(
    state: GameUiState,
    project: (worldX: number, z: number) => { x: number; y: number }
  ): void {
    if (!state.projectileSnapshot) return;
    for (const proj of state.projectileSnapshot) {
      const worldX = (proj.lane - 1) * 2.2;
      const pFront = project(worldX, proj.z + 1.2);
      const pBack = project(worldX, Math.max(0, proj.z));
      const depthT = Math.max(0.1, Math.min(1, 1 - proj.z / 60));

      const boltHalfW = 6.5 * depthT;
      const coreColor: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
      const plasmaColor: [number, number, number, number] = [0.0, 0.96, 1.0, 0.95];

      // Twin plasma cannon bolts (left & right barrel of vehicle)
      const barrelOffset = 18 * depthT;
      const boltHeight = Math.max(12, pBack.y - pFront.y);
      for (const offset of [-barrelOffset, barrelOffset]) {
        // Outer plasma glow
        this.addQuad(
          pBack.x + offset - boltHalfW,
          pBack.y - boltHeight,
          boltHalfW * 2,
          boltHeight,
          plasmaColor,
          plasmaColor
        );
        // Inner white energy beam
        this.addQuad(
          pBack.x + offset - boltHalfW * 0.4,
          pBack.y - boltHeight,
          boltHalfW * 0.8,
          boltHeight,
          coreColor,
          coreColor
        );
      }
    }
  }

  private drawPlayer(
    state: GameUiState,
    project: (worldX: number, z: number) => { x: number; y: number },
    dt: number,
    vanishX: number = this.screenWidth / 2,
    horizonY: number = this.screenHeight * 0.35
  ): void {
    // 1. True physical 3D world projection with dynamic start launch surge
    const introProgress = state.introLaunchProgress ?? 1.0;
    // Cubic ease-out: vehicle swoops smoothly forward into cruising position
    const introEase = 1.0 - Math.pow(1.0 - Math.min(1.0, introProgress), 3);
    const startZOffset = (1.0 - introEase) * -3.5;
    const effectivePlayerZ = GameConfig.PLAYER_Z + startZOffset;

    const playerScreen = project(state.playerX, effectivePlayerZ);
    const jumpLift = state.playerY * 42;
    const px = playerScreen.x;
    const py = playerScreen.y - jumpLift;

    const squashY = state.playerSquashY || 1.0;
    const squashX = state.playerSquashX || 1.0;
    const roll = state.playerRoll || 0.0;

    // Projected boundary points that match the physical 3D hitbox EXACTLY:
    const noseScreen = project(state.playerX, effectivePlayerZ + GameConfig.PLAYER_HITBOX_FRONT);
    const rearScreen = project(state.playerX, effectivePlayerZ - GameConfig.PLAYER_HITBOX_REAR);
    const noseForwardPx = Math.max(26, (playerScreen.y - noseScreen.y) * squashY);
    const rearBehindPx = Math.max(16, (rearScreen.y - playerScreen.y) * squashY);

    // Anchor shadow directly on the road under the center of mass
    const shadowCenterY = playerScreen.y;

    // 1b. Landing Shockwave Ring (expanding energy ripple on the floor!)
    if (state.playerLandingShockwave > 0) {
      const shockProgress = 1.0 - state.playerLandingShockwave;
      const ringRadius = 36 + shockProgress * 140;
      const ringAlpha = state.playerLandingShockwave * 0.85;
      const shockColor: [number, number, number, number] = [0.0, 0.96, 1.0, ringAlpha];
      this.addCircleOutline(px, shadowCenterY, ringRadius, shockColor, 26);
      this.addCircleOutline(px, shadowCenterY, ringRadius * 0.75, [1.0, 0.0, 0.9, ringAlpha * 0.6], 20);
    }

    // 2. Realistic Perspective Ground Shadow with altitude diffusion
    const altRatio = Math.max(0, Math.min(1, state.playerY / 2.2));
    const shadowW = (136 * squashX) * (1.0 - altRatio * 0.45);
    const shadowH = 36 * (1.0 - altRatio * 0.55);
    const shadowAlpha = 0.65 * (1.0 - altRatio * 0.6);
    const shadowColor: [number, number, number, number] = [0.0, 0.0, 0.02, shadowAlpha];
    this.addCircle(px, shadowCenterY, shadowW / 2, shadowColor, [0, 0, 0, 0], 20);

    // 2b. Digital Neon Road Speed Wake & Light Stream in TRUE 3D Perspective!
    const activeSkin = VEHICLE_SKINS[state.equippedSkin] || VEHICLE_SKINS[DEFAULT_SKIN_ID];
    const skinPalette = activeSkin.palette;

    const isOverdrive = state.activePowerUps.includes(PowerUpType.OVERDRIVE);
    const isBoosting = state.isBoosting;
    const isHeadstart = state.headstartActive;

    // Wake extends in 3D world Z behind the vehicle down towards the camera
    const zWakeStart = effectivePlayerZ - 0.7;
    const wakeWorldLength = (isBoosting ? (isHeadstart ? 7.2 : 6.0) : 4.4) * (1.0 - altRatio * 0.4);
    const zWakeEnd = Math.max(0.4, zWakeStart - wakeWorldLength);
    const wakeWorldHalfW = 0.62 * squashX; // ~56% of lane width (lane width is 2.2)

    // Project all 4 corners into screen space using the camera projection:
    // This guarantees 100% mathematical perspective alignment with the lane lines on left, center, and right!
    const wakeFrontL = project(state.playerX - wakeWorldHalfW, zWakeStart);
    const wakeFrontR = project(state.playerX + wakeWorldHalfW, zWakeStart);
    const wakeRearL = project(state.playerX - wakeWorldHalfW * 1.15, zWakeEnd);
    const wakeRearR = project(state.playerX + wakeWorldHalfW * 1.15, zWakeEnd);

    const wakeColorNear: [number, number, number, number] = isOverdrive
      ? [1.0, 0.85, 0.0, 0.5]
      : [skinPalette.wakeColor[0], skinPalette.wakeColor[1], skinPalette.wakeColor[2], isBoosting ? 0.7 : skinPalette.wakeColor[3]];

    this.addPolygon([wakeFrontL, wakeFrontR, wakeRearR, wakeRearL], wakeColorNear);

    // Dynamic digital pixel bars streaming along the wake in true 3D perspective
    const zSpan = zWakeStart - zWakeEnd;
    for (let b = 0; b < 6; b++) {
      const cycleOffset = ((this.runTime * (isBoosting ? 18 : 12) + b * 1.1) % zSpan);
      const bitZ = zWakeStart - cycleOffset;
      const bitAlpha = (1.0 - cycleOffset / zSpan) * 0.85;
      const bitWWorld = 0.30 + (b % 3) * 0.12;
      const bitXWorld = state.playerX + ((b % 2 === 0 ? -1 : 1) * 0.20);

      const pBitL = project(bitXWorld - bitWWorld / 2, bitZ);
      const pBitR = project(bitXWorld + bitWWorld / 2, bitZ);
      const bitHeightPx = 3.5;

      this.addQuad(
        pBitL.x,
        pBitL.y - bitHeightPx / 2,
        pBitR.x - pBitL.x,
        bitHeightPx,
        [skinPalette.finColor[0], skinPalette.finColor[1], skinPalette.finColor[2], bitAlpha],
        [1, 1, 1, bitAlpha]
      );
    }

    // 3. Active Power-up Shield Bubble
    if (state.activePowerUps.includes(PowerUpType.PHASE_SHIELD)) {
      const shieldPulse = 1.0 + Math.sin(this.runTime * 12) * 0.08;
      const shieldRadius = 112 * shieldPulse;
      const shieldColor: [number, number, number, number] = [0.0, 0.96, 1.0, 0.3];
      const shieldRingColor: [number, number, number, number] = [0.0, 0.96, 1.0, 0.9];
      this.addCircle(px, py + 12, shieldRadius, shieldColor, shieldColor, 26);
      this.addCircleOutline(px, py + 12, shieldRadius, shieldRingColor, 26);
      this.addCircleOutline(px, py + 12, shieldRadius * 0.92, [1, 1, 1, 0.6], 20);
    }

    if (state.activePowerUps.includes(PowerUpType.OVERDRIVE)) {
      const auraPulse = 1.0 + Math.sin(this.runTime * 18) * 0.14;
      const auraRadius = 104 * auraPulse;
      this.addCircle(px, py + 12, auraRadius, [1.0, 0.84, 0.0, 0.25], [1.0, 0.0, 0.85, 0.15], 22);
    }

    // 4. HEROIC 3D CYBERPUNK INTERCEPTOR SPEEDER CRAFT (DOUBLED 2X SIZE)
    const wingSpan = 60 * squashX;
    const bankLift = roll * 22;
    // Perspective slant vector matching the road rays from vanishing point:
    const laneSlant = (px - vanishX) / Math.max(1, shadowCenterY - horizonY);

    // Coordinate points strictly matching the physical 3D hitbox with perspective alignment:
    const nose = { x: px - noseForwardPx * laneSlant + roll * 10, y: py - noseForwardPx };
    const leftWingTip = { x: px - wingSpan + rearBehindPx * 0.4 * laneSlant - roll * 14, y: py + rearBehindPx * 0.4 + bankLift };
    const rightWingTip = { x: px + wingSpan + rearBehindPx * 0.4 * laneSlant - roll * 14, y: py + rearBehindPx * 0.4 - bankLift };
    const leftWingRoot = { x: px - wingSpan * 0.42 + rearBehindPx * laneSlant, y: py + rearBehindPx + bankLift * 0.4 };
    const rightWingRoot = { x: px + wingSpan * 0.42 + rearBehindPx * laneSlant, y: py + rearBehindPx - bankLift * 0.4 };
    const centerEngine = { x: px + rearBehindPx * 0.65 * laneSlant, y: py + rearBehindPx * 0.65 };

    // Underwing Aerodynamic Wings (swept back stealth design) - Custom Skin
    const wingColor: [number, number, number, number] = skinPalette.wingColor;
    this.addPolygon([nose, leftWingTip, leftWingRoot, centerEngine], wingColor);
    this.addPolygon([nose, rightWingTip, rightWingRoot, centerEngine], wingColor);

    // Stealth Inner Armor Fuselage (dark carbon titanium) - Custom Skin
    const armorColor: [number, number, number, number] = skinPalette.armorColor;
    const leftArmor = { x: px - wingSpan * 0.48 + rearBehindPx * 0.45 * laneSlant, y: py + rearBehindPx * 0.45 + bankLift * 0.5 };
    const rightArmor = { x: px + wingSpan * 0.48 + rearBehindPx * 0.45 * laneSlant, y: py + rearBehindPx * 0.45 - bankLift * 0.5 };
    this.addPolygon([nose, rightArmor, centerEngine, leftArmor], armorColor);

    // Glowing Wingtip Stabilizers / Plasma fins - Custom Skin
    const finColor: [number, number, number, number] = skinPalette.finColor;
    const finAccentColor: [number, number, number, number] = skinPalette.finAccentColor;
    this.addLine(nose.x, nose.y, leftWingTip.x, leftWingTip.y, finColor, finColor);
    this.addLine(nose.x, nose.y, rightWingTip.x, rightWingTip.y, finColor, finColor);
    this.addLine(leftWingTip.x, leftWingTip.y, leftWingRoot.x, leftWingRoot.y, finAccentColor, finColor);
    this.addLine(rightWingTip.x, rightWingTip.y, rightWingRoot.x, rightWingRoot.y, finAccentColor, finColor);

    // Elevated Cockpit Canopy (radiant photon visor) - Custom Skin
    const visorTop = { x: px - noseForwardPx * 0.45 * laneSlant + roll * 6, y: py - noseForwardPx * 0.45 };
    const visorBot = { x: px + rearBehindPx * 0.35 * laneSlant, y: py + rearBehindPx * 0.35 };
    const visorL = { x: px - 20 * squashX, y: py + bankLift * 0.3 };
    const visorR = { x: px + 20 * squashX, y: py - bankLift * 0.3 };
    this.addPolygon([visorTop, visorR, visorBot, visorL], skinPalette.visorColor);
    this.addCircle(px, py, 13, [1, 1, 1, 1], skinPalette.visorGlowColor, 14);

    // 5. Dual Reactive Plasma Thruster Turbines with dynamic flame length & perspective angle
    const boostExtra = isBoosting ? (isHeadstart ? 55 : 45) : 0;
    const flameBaseLen = (isOverdrive ? 65 : 36) + boostExtra + Math.sin(this.runTime * 32) * (isBoosting ? 14 : 8);
    const leftEngineX = px - 30 * squashX + rearBehindPx * laneSlant - roll * 6;
    const rightEngineX = px + 30 * squashX + rearBehindPx * laneSlant - roll * 6;
    const engineY = py + rearBehindPx;

    const engineRingColor: [number, number, number, number] = isBoosting
      ? [1.0, 1.0, 1.0, 1.0]
      : skinPalette.engineRingColor;
    this.addCircle(leftEngineX, engineY, isBoosting ? 14.0 : 11.5, [1, 1, 1, 1], engineRingColor, 14);
    this.addCircle(rightEngineX, engineY, isBoosting ? 14.0 : 11.5, [1, 1, 1, 1], engineRingColor, 14);

    // Pulsing Afterburner Jet Flame Cones slanting along lane perspective
    const jetColorOuter: [number, number, number, number] = isOverdrive
      ? [1.0, 0.84, 0.0, 0.95]
      : isBoosting
      ? (isHeadstart ? [1.0, 0.95, 0.2, 1.0] : [skinPalette.jetOuterColor[0] * 1.1, skinPalette.jetOuterColor[1] * 1.1, skinPalette.jetOuterColor[2] * 1.1, 1.0])
      : skinPalette.jetOuterColor;
    const jetColorCore: [number, number, number, number] = skinPalette.jetCoreColor;

    // Left Jet Flame - tips slant with lane perspective
    const flameWidth = isBoosting ? 13.0 : 9.5;
    const leftTip = { x: leftEngineX + flameBaseLen * laneSlant, y: engineY + flameBaseLen };
    this.addPolygon(
      [{ x: leftEngineX - flameWidth, y: engineY }, { x: leftEngineX + flameWidth, y: engineY }, leftTip],
      jetColorOuter
    );
    this.addPolygon(
      [{ x: leftEngineX - flameWidth * 0.45, y: engineY }, { x: leftEngineX + flameWidth * 0.45, y: engineY }, { x: leftEngineX + flameBaseLen * 0.6 * laneSlant, y: engineY + flameBaseLen * 0.6 }],
      jetColorCore
    );

    // Right Jet Flame - tips slant with lane perspective
    const rightTip = { x: rightEngineX + flameBaseLen * laneSlant, y: engineY + flameBaseLen };
    this.addPolygon(
      [{ x: rightEngineX - flameWidth, y: engineY }, { x: rightEngineX + flameWidth, y: engineY }, rightTip],
      jetColorOuter
    );
    this.addPolygon(
      [{ x: rightEngineX - flameWidth * 0.45, y: engineY }, { x: rightEngineX + flameWidth * 0.45, y: engineY }, { x: rightEngineX + flameBaseLen * 0.6 * laneSlant, y: engineY + flameBaseLen * 0.6 }],
      jetColorCore
    );

    // 6. Trail Particles Emission (intense jet stream when boosting)
    if (Math.random() < (isBoosting ? 1.0 : 0.9)) {
      const pColor: [number, number, number, number] = isOverdrive
        ? [1.0, 0.84, 0.0, 0.95]
        : isBoosting
        ? (isHeadstart ? [1.0, 0.9, 0.2, 1.0] : skinPalette.finColor)
        : (Math.random() < 0.5 ? skinPalette.finColor : skinPalette.finAccentColor);

      const particleSpeed = isBoosting ? 140 : 90;
      this.particles.push({
        x: leftEngineX + (Math.random() * 4 - 2),
        y: engineY + flameBaseLen * 0.7,
        vx: (Math.random() - 0.5) * (isBoosting ? 24 : 16) - roll * 20,
        vy: particleSpeed + Math.random() * 60,
        life: 0,
        maxLife: isBoosting ? 0.38 : 0.28,
        color: pColor,
        size: (isBoosting ? 7 : 5) + Math.random() * 3,
      });

      this.particles.push({
        x: rightEngineX + (Math.random() * 4 - 2),
        y: engineY + flameBaseLen * 0.7,
        vx: (Math.random() - 0.5) * (isBoosting ? 24 : 16) - roll * 20,
        vy: particleSpeed + Math.random() * 60,
        life: 0,
        maxLife: isBoosting ? 0.38 : 0.28,
        color: pColor,
        size: (isBoosting ? 7 : 5) + Math.random() * 3,
      });
    }

    // 7. Hyperspace Warp Lines when Boosting
    if (isBoosting) {
      for (let i = 0; i < 6; i++) {
        const streakX = i % 2 === 0 ? 25 + i * 20 : this.screenWidth - 25 - (i - 1) * 20;
        const streakY = ((this.runTime * 950 + i * 160) % (this.screenHeight + 250)) - 80;
        const streakLen = 70 + (i % 3) * 35;
        const streakAlpha = 0.55 + Math.sin(this.runTime * 24 + i) * 0.35;
        const streakColor: [number, number, number, number] = [0.0, 0.96, 1.0, streakAlpha];
        this.addLine(streakX, streakY, streakX, streakY + streakLen, streakColor, [1, 1, 1, 0.9]);
      }
    }
  }

  private updateAndDrawParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const alpha = 1.0 - p.life / p.maxLife;
      const c: [number, number, number, number] = [p.color[0], p.color[1], p.color[2], p.color[3] * alpha];
      this.addCircle(p.x, p.y, p.size * alpha, c, c, 6);
    }
  }

  // --- Geometry Helpers ---
  private addLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    c1: [number, number, number, number],
    c2: [number, number, number, number]
  ): void {
    this.linePositions.push(x1, y1, x2, y2);
    this.lineColors.push(...c1, ...c2);
  }

  private addQuad(
    x: number,
    y: number,
    w: number,
    h: number,
    cTop: [number, number, number, number],
    cBot: [number, number, number, number]
  ): void {
    // 2 triangles
    this.positions.push(
      x, y,
      x + w, y,
      x, y + h,
      x, y + h,
      x + w, y,
      x + w, y + h
    );
    this.colors.push(
      ...cTop,
      ...cTop,
      ...cBot,
      ...cBot,
      ...cTop,
      ...cBot
    );
  }

  private addPolygon(
    pts: Array<{ x: number; y: number }>,
    c: [number, number, number, number]
  ): void {
    if (pts.length < 3) return;
    for (let i = 1; i < pts.length - 1; i++) {
      this.positions.push(
        pts[0].x, pts[0].y,
        pts[i].x, pts[i].y,
        pts[i + 1].x, pts[i + 1].y
      );
      this.colors.push(...c, ...c, ...c);
    }
  }

  private addCircle(
    cx: number,
    cy: number,
    r: number,
    cCenter: [number, number, number, number],
    cEdge: [number, number, number, number],
    segments: number = 16
  ): void {
    const step = (Math.PI * 2) / segments;
    for (let i = 0; i < segments; i++) {
      const a1 = i * step;
      const a2 = (i + 1) * step;
      this.positions.push(
        cx, cy,
        cx + Math.cos(a1) * r, cy + Math.sin(a1) * r,
        cx + Math.cos(a2) * r, cy + Math.sin(a2) * r
      );
      this.colors.push(...cCenter, ...cEdge, ...cEdge);
    }
  }

  private addCircleOutline(
    cx: number,
    cy: number,
    r: number,
    color: [number, number, number, number],
    segments: number = 16
  ): void {
    const step = (Math.PI * 2) / segments;
    for (let i = 0; i < segments; i++) {
      const a1 = i * step;
      const a2 = (i + 1) * step;
      this.addLine(
        cx + Math.cos(a1) * r,
        cy + Math.sin(a1) * r,
        cx + Math.cos(a2) * r,
        cy + Math.sin(a2) * r,
        color,
        color
      );
    }
  }

  private flush(gl: ExpoWebGLRenderingContext): void {
    if (this.positions.length > 0 && this.positionBuffer && this.colorBuffer) {
      // Draw Triangles
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.aPositionLoc);
      gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.aColorLoc);
      gl.vertexAttribPointer(this.aColorLoc, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 2);
    }

    if (this.linePositions.length > 0 && this.positionBuffer && this.colorBuffer) {
      // Draw Lines
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.linePositions), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.aPositionLoc);
      gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lineColors), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.aColorLoc);
      gl.vertexAttribPointer(this.aColorLoc, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.LINES, 0, this.linePositions.length / 2);
    }
  }
}
