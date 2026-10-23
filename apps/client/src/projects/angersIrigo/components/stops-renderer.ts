/* eslint-disable citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { canvas } from "leaflet";

/**
 * Un seul <canvas> pour tous les points d'arrêt (~900, plus ceux du tracé affiché) : bien plus
 * léger que des centaines d'éléments SVG. La tolérance agrandit la zone cliquable de chaque point.
 */
export const stopsRenderer = canvas({ padding: 0.5, tolerance: 3 });
