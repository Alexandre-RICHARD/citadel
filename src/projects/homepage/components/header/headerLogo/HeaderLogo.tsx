import { useLayoutEffect, useRef } from "react";

import { useSessionStorage } from "../../../../../common/helpers/hook/useSessionStorage";
import styles from "./HeaderLogo.module.scss";

export function HeaderLogo() {
	const logoRef = useRef<HTMLDivElement>(null);

	const { value: cancelAnimation, set } = useSessionStorage(
		"headerLogoAlreadyDisplayed",
		false,
	);

	useLayoutEffect(() => {
		const body = document.querySelector("body");
		if (body) {
			setTimeout(() => {
				body.style.overflowY = "visible";
			}, 261 * 9.55);
			setTimeout(() => {
				set(true);
			}, 261 * 11.62);
		}
	}, [set]);

	return (
		<div
			ref={logoRef}
			className={`${styles.headerLogoCache} ${cancelAnimation ? styles.noAnim : undefined}`}
		>
			<div className={styles.headerLogoContainer}>
				<div className={`${styles.headerLogoDiv} ${styles.headerLogoDivOne}`}>
					<div />
					<div />
					<div />
				</div>
				<div className={`${styles.headerLogoDiv} ${styles.headerLogoDivTwo}`}>
					<div />
					<div />
					<div />
				</div>
				<div className={`${styles.headerLogoDiv} ${styles.headerLogoDivThree}`}>
					<div />
					<div />
					<div />
				</div>
				<div className={`${styles.headerLogoDiv} ${styles.headerLogoDivFour}`}>
					<div />
					<div />
					<div />
				</div>
				<div className={`${styles.headerLogoDiv} ${styles.headerLogoDivFive}`}>
					<div />
					<div />
					<div />
				</div>
				<div className={`${styles.headerLogoDiv} ${styles.headerLogoDivSix}`}>
					<div />
					<div />
					<div />
				</div>
				<span className={styles.headerLogoLetter}>A</span>
			</div>
		</div>
	);
}
