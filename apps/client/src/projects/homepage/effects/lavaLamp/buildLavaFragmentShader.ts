// Des metaballs : chaque blob ajoute un champ qui décroît avec la distance, la cire est là où le champ dépasse 1.
// Hors des blobs, le canvas reste transparent : le fond est celui de la page, et les fonds animés des projets
// passent derrière les blobs
export function buildLavaFragmentShader(ballCount: number): string {
	return `
// highp quand le GPU le permet : sur Linux (Mesa), mediump est un flottant 16 bits (max 65504, plus petit normal 6e-5),
// et les calculs au centre des blobs débordaient en NaN, ce qui laissait un trou sombre au milieu de chacun
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uResolution;
uniform vec3 uBalls[${ballCount}];
uniform vec3 uColors[${ballCount}];
uniform float uDark;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
	vec2 p = gl_FragCoord.xy / uResolution.y;
	float field = 0.0;
	vec3 color = vec3(0.0);
	vec2 gradient = vec2(0.0);
	for (int i = 0; i < ${ballCount}; i++) {
		vec2 d = p - uBalls[i].xy;
		// Plancher assez haut pour que rien ne déborde, même en 16 bits : le champ reste très au-dessus de 1 au centre
		float dd = max(dot(d, d), 1e-3);
		float r2 = uBalls[i].z * uBalls[i].z;
		float v = r2 / dd;
		field += v;
		color += uColors[i] * v;
		// Même valeur que -2 r2 d / dd², écrite sans dd² qui tombe à 0 en 16 bits
		gradient += -2.0 * v * d / dd;
	}
	color /= max(field, 1e-3);
	// Bord net : la largeur de la transition suit la pente du champ, pour garder 1 à 2 pixels partout
	float aa = length(gradient) / uResolution.y * 1.2;
	float edge = smoothstep(1.0 - aa, 1.0 + aa, field);
	// Le coeur s'éclaircit, le bord fonce un peu : du volume, comme de la cire
	float core = smoothstep(1.0, 4.5, field);
	vec3 blob = color * (0.78 + 0.34 * core) + vec3(0.06) * core * uDark;
	// Halo léger autour des blobs
	float halo = smoothstep(0.3, 1.0, field) * (1.0 - edge) * 0.14;
	// Grain, pour éviter les bandes dans les dégradés
	vec3 grain = vec3((hash(gl_FragCoord.xy) - 0.5) * 0.03);
	gl_FragColor = vec4((blob + grain) * edge + (color + grain) * halo, edge + halo);
}`;
}
