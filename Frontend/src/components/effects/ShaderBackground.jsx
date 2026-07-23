import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 m = u_mouse / u_resolution;
    
    // Smooth botanical liquid motion
    float t = u_time * 0.15;
    
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    
    // Mouse proximity — distance from cursor in UV space
    vec2 mouseUV = m * 2.0 - 1.0;
    mouseUV.x *= u_resolution.x / u_resolution.y;
    float mouseDist = length(p - mouseUV);
    float mouseInfluence = smoothstep(1.2, 0.0, mouseDist);
    
    float noise = 0.0;
    vec2 q = p;
    
    // Higher mouse multiplier (6x) + extra amplitude near cursor
    float amp = 0.3 + mouseInfluence * 0.25;
    for(float i = 1.0; i < 4.0; i++) {
        q.x += amp * sin(i * q.y + t + m.x * 6.0);
        q.y += amp * cos(i * q.x + t + m.y * 6.0);
        noise += abs(sin(length(q) - t)) / i;
    }
    
    // Palette: Sage Green to Gold to Deep Forest
    vec3 color1 = vec3(0.42, 0.50, 0.31); // Sage: #6B7F4F
    vec3 color2 = vec3(0.83, 0.69, 0.42); // Gold: #D4AF6A
    vec3 color3 = vec3(0.04, 0.06, 0.05); // Deep Forest: #0B0F0C
    
    vec3 color = mix(color3, color1, noise * 0.5);
    color = mix(color, color2, pow(noise, 3.0) * 0.4);
    
    // Mouse-proximity glow — brightens near cursor
    color += color1 * mouseInfluence * 0.35;
    
    // Subtle vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(p));
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
}`;

export default function ShaderBackground({ className = '', style = {} }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sync canvas size
    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    function createShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouseRef.current.x = nx * canvas.width;
        mouseRef.current.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(render);
    }
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
}
