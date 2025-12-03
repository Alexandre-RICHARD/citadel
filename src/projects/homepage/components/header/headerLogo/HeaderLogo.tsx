import "./HeaderLogo.scss";

import { useLayoutEffect } from "react";

export function HeaderLogo() {
	useLayoutEffect(() => {
		const body = document.querySelector("body");
		if (body) {
			setTimeout(() => {
				body.style.overflowY = "visible";
			}, 261 * 9.55);
		}
	}, []);

	return (
		<div className="header-logo-cache">
			<div className="header-logo-container">
				<div className="header-logo-div header-logo-div-one">
					<div />
					<div />
					<div />
				</div>
				<div className="header-logo-div header-logo-div-two">
					<div />
					<div />
					<div />
				</div>
				<div className="header-logo-div header-logo-div-tre">
					<div />
					<div />
					<div />
				</div>
				<div className="header-logo-div header-logo-div-for">
					<div />
					<div />
					<div />
				</div>
				<div className="header-logo-div header-logo-div-fiv">
					<div />
					<div />
					<div />
				</div>
				<div className="header-logo-div header-logo-div-six">
					<div />
					<div />
					<div />
				</div>
				<span className="header-logo-letter">A</span>
			</div>
		</div>
	);
}
