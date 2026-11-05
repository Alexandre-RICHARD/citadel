import { DatabaseError } from "sequelize";

// ER_CHECKREAD de MariaDB
const RECORD_CHANGED_SINCE_READ_ERRNO = 1020;

/**
 * L'écriture d'une ligne qu'une autre transaction a créée ou changée depuis la première lecture de celle-ci
 * (innodb_snapshot_isolation). Pour une insertion, c'est le doublon de clé d'un ajout concurrent
 */
export function isRecordChangedSinceReadError(error: unknown): boolean {
	if (!(error instanceof DatabaseError)) return false;
	return (
		"errno" in error.parent &&
		error.parent.errno === RECORD_CHANGED_SINCE_READ_ERRNO
	);
}
