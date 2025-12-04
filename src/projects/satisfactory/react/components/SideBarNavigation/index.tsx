import { roundNumber } from "@nexus/nexusExporter";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { EndpointEnum } from "../../../enums/endpoint.enum";
import { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import type { WorldInvDto } from "../../../types/satisfactory/apis/dataTransferObject/worldInvDto.type";
import type { WorldInventoryFM } from "../../../types/satisfactory/apis/frontModel/worldInventoryFm.type";
import { useAutoRefetch } from "../../hooks/useAutoRefetch";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import { LanguagesSelector } from "../LanguageSelector";
import styles from "./styles.module.scss";

export function SideBarNavigation(): React.JSX.Element {
	const t = useCustomTranslations();
	const { data: worldInventory } = useAutoRefetch<
		WorldInvDto[],
		WorldInventoryFM[]
	>(EndpointEnum.WORLD_INVENTORY);
	const [isSideBarLarge, setIsSideBarLarge] = useState(false);

	const [currentGift, setCurrentGift] = useState(0);
	const [lastDifference, setLastDifference] = useState<number[]>([]);

	useEffect(() => {
		const giftValue =
			worldInventory?.find(
				(item) => item.className === GameClassNamesEnum.Desc_Gift_C,
			)?.amount ?? 0;
		setCurrentGift((prev) => {
			const isNull = prev === 0;
			if (!isNull) {
				const difference = giftValue - prev;
				setLastDifference((prev5Mintes) => {
					const newArray = [...prev5Mintes, difference];
					if (newArray.length > 30) newArray.shift();
					return newArray;
				});
			}
			return giftValue;
		});
	}, [worldInventory]);

	const linkGroups = [
		[
			{
				label: t(TF.COMMON, "homepage"),
				link: "/",
			},
			{
				label: t(TF.COMMON, "recipes"),
				link: "/recipes",
			},
			{
				label: t(TF.COMMON, "calculator"),
				link: "/calculator",
			},
		],
		[
			{
				label: t(TF.COMMON, "machines"),
				link: "/frm/allMachines",
			},
		],
		[
			{
				label: t(TF.COMMON, "settings"),
				link: "/settings",
			},
		],
	];

	return (
		<aside
			className={`bg-blue-900 h-screen flex flex-col gap-6 py-6 overflow-x-hidden overflow-y-auto transition-all ease-in-out duration-250 ${isSideBarLarge ? styles.sidebar_navigation_large : styles.sidebar_navigation_small}`}
		>
			<button
				type="button"
				onClick={() => setIsSideBarLarge((prev) => !prev)}
			>
				{isSideBarLarge ? "Collapse" : "Expand"}
			</button>
			<div className="flex flex-col justify-between h-full">
				{linkGroups.map((groupLink) => (
					<div
						key={groupLink[0].link}
						className="flex flex-col"
					>
						{groupLink.map((link) => (
							<NavLink
								key={link.label}
								to={link.link}
							>
								<p className="text-center">{link.label}</p>
							</NavLink>
						))}
					</div>
				))}
				<div className="flex center flex-col p-3">
					<p>{currentGift} gift</p>
					<p>{roundNumber(currentGift / 2025 / 60, 2)} h</p>
					<p>
						{roundNumber(
							(lastDifference.reduce((a, v) => a + v, 0) /
								lastDifference.length) *
								6,
							1,
						)}{" "}
						gift / min (last 5 min)
					</p>
				</div>
				<LanguagesSelector />
			</div>
		</aside>
	);
}
