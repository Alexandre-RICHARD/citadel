// Nombre maximal de caractères accepté par chaque type de colonne SQL
export enum SqlColumnMaxLengthEnum {
	VARCHAR_100 = 100,
	VARCHAR_255 = 255,
	VARCHAR_1000 = 1000,
	// TEXT : 65 535 octets, soit 16 383 caractères au pire en utf8mb4 (4 octets par caractère)
	TEXT = 16_383,
}
