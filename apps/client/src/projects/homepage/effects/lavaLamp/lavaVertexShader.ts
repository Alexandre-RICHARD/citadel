// Un seul triangle qui couvre tout l'écran : tout le dessin se fait dans le fragment shader
export const lavaVertexShader = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;
