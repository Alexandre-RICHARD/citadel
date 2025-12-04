import { Outlet } from "react-router";

import { DefaultReturnToHomepageButton } from "../../appNavigation/defaultReturnToHomepageButton.tsx/DefaultReturnToHomepageButton";
import { Footer } from "./components/Footer";
import { SideBarNavigation } from "./components/SideBarNavigation";

export function SatisfactoryLayout() {
	return (
		<>
			<DefaultReturnToHomepageButton />
			<div className="bg-black flex flex-row text-white min-w-full max-w-full min-h-screen max-h-screen overflow-hidden">
				<SideBarNavigation />
				<div className="w-full flex flex-col h-screen">
					<main className="flex-1 overflow-y-auto">
						<div className="container mt-4 mb-4 mx-auto w-full">
							<Outlet />
						</div>
					</main>
					<div className="container mx-auto w-full">
						<Footer />
					</div>
				</div>
			</div>
		</>
	);
}
