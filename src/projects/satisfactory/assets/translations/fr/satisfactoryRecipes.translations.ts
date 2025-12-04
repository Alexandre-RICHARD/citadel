import { RecipesEnum } from "../../../enums/recipes.enum";

export default {
  // ====== Raw resources items =======
  // Iron_Ore
  [RecipesEnum.Iron_Ore_Limestone]: "Minerai de fer (calcaire)",
  // Copper_Ore
  [RecipesEnum.Copper_Ore_Quartz]: "Minerai de cuivre (quartz)",
  [RecipesEnum.Copper_Ore_Sulfur]: "Minerai de cuivre (soufre)",
  // Limestone
  [RecipesEnum.Limestone_Sulfur]: "Calcaire (soufre)",
  // Coal
  [RecipesEnum.Alternate_Charcoal]: "Charbon de bois (alternative)",
  [RecipesEnum.Alternate_Biocoal]: "Charbon de biomasse (alternative)",
  [RecipesEnum.Coal_Iron]: "Charbon (fer)",
  [RecipesEnum.Coal_Limestone]: "Charbon (calcaire)",
  // Water
  [RecipesEnum.Unpackage_Water]: "Eau non conditionnée",
  // Packaged_Water
  [RecipesEnum.Packaged_Water]: "Eau conditionnée",
  // Crude_Oil
  [RecipesEnum.Unpackage_Oil]: "Pétrole non conditionné",
  // Packaged_Oil
  [RecipesEnum.Packaged_Oil]: "Pétrole conditionné",
  // Caterium_Ore
  [RecipesEnum.Caterium_Ore_Copper]: "Minerai de caterium (cuivre)",
  [RecipesEnum.Caterium_Ore_Quartz]: "Minerai de caterium (quartz)",
  // Bauxite
  [RecipesEnum.Bauxite_Caterium]: "Bauxite (caterium)",
  [RecipesEnum.Bauxite_Copper]: "Bauxite (cuivre)",
  // Raw_Quartz
  [RecipesEnum.Raw_Quartz_Bauxite]: "Quartz brut (bauxite)",
  [RecipesEnum.Raw_Quartz_Coal]: "Quartz brut (charbon)",
  // Sulfur
  [RecipesEnum.Sulfur_Coal]: "Soufre (charbon)",
  [RecipesEnum.Sulfur_Iron]: "Soufre (fer)",
  // Uranium
  [RecipesEnum.Uranium_Ore_Bauxite]: "Minerai d'uranium (bauxite)",
  // Nitrogen_Gas
  [RecipesEnum.Unpackage_Nitrogen_Gas]: "Azote non conditionné",
  [RecipesEnum.Nitrogen_Gas_Bauxite]: "Azote (bauxite)",
  [RecipesEnum.Nitrogen_Gas_Caterium]: "Azote (caterium)",
  // Packaged_Nitrogen_Gas
  [RecipesEnum.Packaged_Nitrogen_Gas]: "Azote gazeux conditionné",

  // ========== Tier 1 items ==========
  // Iron_Ingot
  [RecipesEnum.Iron_Ingot]: "Lingot de fer",
  [RecipesEnum.Alternate_Basic_Iron_Ingot]:
    "Lingot de fer basique (alternative)",
  [RecipesEnum.Alternate_Pure_Iron_Ingot]: "Lingot de fer pur (alternative)",
  [RecipesEnum.Alternate_Iron_Alloy_Ingot]:
    "Lingot d'alliage de fer (alternative)",
  [RecipesEnum.Alternate_Leached_Iron_Ingot]:
    "Lingot de fer lessivé (alternative)",
  // Iron_Plate
  [RecipesEnum.Iron_Plate]: "Plaque de fer",
  [RecipesEnum.Alternate_Coated_Iron_Plate]:
    "Plaque de fer recouverte (alternative)",
  [RecipesEnum.Alternate_Steel_Cast_Plate]:
    "Plaque d'acier coulé (alternative)",
  // Iron_Rod
  [RecipesEnum.Iron_Rod]: "Barre de fer",
  [RecipesEnum.Alternate_Steel_Rod]: "Tige d'acier (alternative)",
  [RecipesEnum.Alternate_Aluminum_Rod]: "Barre d'aluminium (alternative)",
  // Copper_Ingot
  [RecipesEnum.Copper_Ingot]: "Lingot de cuivre",
  [RecipesEnum.Alternate_Tempered_Copper_Ingot]:
    "Lingot de cuivre trempé (alternative)",
  [RecipesEnum.Alternate_Pure_Copper_Ingot]:
    "Lingot de cuivre pur (alternative)",
  [RecipesEnum.Alternate_Copper_Alloy_Ingot]:
    "Lingot d'alliage de cuivre (alternative)",
  [RecipesEnum.Alternate_Leached_Copper_Ingot]:
    "Lingot de cuivre lessivé (alternative)",
  // Wire
  [RecipesEnum.Wire]: "Fil électrique",
  [RecipesEnum.Alternate_Iron_Wire]: "Fil de fer (alternative)",
  [RecipesEnum.Alternate_Caterium_Wire]: "Fil de catérium (alternative)",
  [RecipesEnum.Alternate_Fused_Wire]: "Fil fusionné (alternative)",
  // Cable
  [RecipesEnum.Cable]: "Câble",
  [RecipesEnum.Alternate_Coated_Cable]: "Câble recouvert (alternative)",
  [RecipesEnum.Alternate_Insulated_Cable]: "Câble isolé (alternative)",
  [RecipesEnum.Alternate_Quickwire_Cable]: "Câble filactif (alternative)",
  // Concrete
  [RecipesEnum.Concrete]: "Béton",
  [RecipesEnum.Alternate_Wet_Concrete]: "Béton humide (alternative)",
  [RecipesEnum.Alternate_Rubber_Concrete]: "Béton de caoutchouc (alternative)",
  [RecipesEnum.Alternate_Fine_Concrete]: "Béton fin (alternative)",
  // Screw
  [RecipesEnum.Screw]: "Vis",
  [RecipesEnum.Alternate_Cast_Screw]: "Vis en fonte (alternative)",
  [RecipesEnum.Alternate_Steel_Screw]: "Vis en acier (alternative)",
  // Reinforced_Iron_Plate
  [RecipesEnum.Reinforced_Iron_Plate]: "Plaque de fer renforcée",
  [RecipesEnum.Alternate_Stitched_Iron_Plate]:
    "Plaque de fer soudée (alternative)",
  [RecipesEnum.Alternate_Bolted_Iron_Plate]:
    "Plaque de fer boulonnée (alternative)",
  [RecipesEnum.Alternate_Adhered_Iron_Plate]:
    "Plaque de fer adhérente (alternative)",
  // Biomass
  [RecipesEnum.Biomass_Wood]: "Biomasse (bois)",
  [RecipesEnum.Biomass_Leaves]: "Biomasse (feuilles)",
  [RecipesEnum.Biomass_Alien_Protein]: "Biomasse (protéine extraterrestre)",
  [RecipesEnum.Biomass_Mycelia]: "Biomasse (mycélium)",

  // ========== Tier 2 items ==========
  // Copper_Sheet
  [RecipesEnum.Copper_Sheet]: "Tôle de cuivre",
  [RecipesEnum.Alternate_Steamed_Copper_Sheet]:
    "Tôle de cuivre recuite (alternative)",
  // Rotor
  [RecipesEnum.Rotor]: "Rotor",
  [RecipesEnum.Alternate_Copper_Rotor]: "Rotor en cuivre (alternative)",
  [RecipesEnum.Alternate_Steel_Rotor]: "Rotor en acier (alternative)",
  // Modular_Frame
  [RecipesEnum.Modular_Frame]: "Cadre modulaire",
  [RecipesEnum.Alternate_Steeled_Frame]: "Cadre en acier (alternative)",
  [RecipesEnum.Alternate_Bolted_Frame]: "Cadre boulonné (alternative)",
  // Smart_Plating
  [RecipesEnum.Smart_Plating]: "Placage intelligent",
  [RecipesEnum.Alternate_Plastic_Smart_Plating]:
    "Placage en plastique intelligent (alternative)",
  // Solid_Biofuel
  [RecipesEnum.Solid_Biofuel]: "Biocarburant solide",

  // ========== Tier 3 items ==========
  // Steel_Ingot
  [RecipesEnum.Steel_Ingot]: "Lingot d'acier",
  [RecipesEnum.Alternate_Solid_Steel_Ingot]:
    "Lingot d'acier solide (alternative)",
  [RecipesEnum.Alternate_Coke_Steel_Ingot]:
    "Lingot de coke d'acier (alternative)",
  [RecipesEnum.Alternate_Compacted_Steel_Ingot]:
    "Lingot d'acier compacté (alternative)",
  // Steel_Beam
  [RecipesEnum.Steel_Beam]: "Poutre en acier",
  [RecipesEnum.Alternate_Molded_Beam]: "Poutre moulée (alternative)",
  [RecipesEnum.Alternate_Aluminum_Beam]: "Poutre en aluminium (alternative)",
  // Steel_Pipe
  [RecipesEnum.Steel_Pipe]: "Tuyau en acier",
  [RecipesEnum.Alternate_Iron_Pipe]: "Tuyau en fer (alternative)",
  [RecipesEnum.Alternate_Molded_Steel_Pipe]:
    "Tuyau en acier moulé (alternative)",
  // Versatile_Framework
  [RecipesEnum.Versatile_Framework]: "Structure polyvalente",
  [RecipesEnum.Alternate_Flexible_Framework]:
    "Structure flexible (alternative)",

  // ========== Tier 4 items ==========
  // Encased_Industrial_Beam
  [RecipesEnum.Encased_Industrial_Beam]: "Poutre en béton armé",
  [RecipesEnum.Alternate_Encased_Industrial_Pipe]:
    "Tuyau industriel renforcé (alternative)",
  // Stator
  [RecipesEnum.Stator]: "Stator",
  [RecipesEnum.Alternate_Quickwire_Stator]: "Stator en filactif (alternative)",
  // Motor
  [RecipesEnum.Motor]: "Moteur",
  [RecipesEnum.Alternate_Rigor_Motor]: "Moteur rigide (alternative)",
  [RecipesEnum.Alternate_Electric_Motor]: "Moteur électrique (alternative)",
  // Automated_Wiring
  [RecipesEnum.Automated_Wiring]: "Câblage automatisé",
  [RecipesEnum.Alternate_Automated_Speed_Wiring]:
    "Filactif automatisé (alternative)",

  // ========== Tier 5 items ==========
  // Plastic
  [RecipesEnum.Residual_Plastic]: "Plastique résiduel",
  [RecipesEnum.Plastic]: "Plastique",
  [RecipesEnum.Alternate_Recycled_Plastic]: "Plastique recyclé (alternative)",
  // Rubber
  [RecipesEnum.Residual_Rubber]: "Caoutchouc résiduel",
  [RecipesEnum.Rubber]: "Caoutchouc",
  [RecipesEnum.Alternate_Recycled_Rubber]: "Caoutchouc recyclé (alternative)",
  // Polymer_Resin
  [RecipesEnum.Alternate_Polymer_Resin]: "Résine polymère (alternative)",
  // Petroleum_Coke
  [RecipesEnum.Petroleum_Coke]: "Coke de pétrole",
  // Circuit_Board
  [RecipesEnum.Circuit_Board]: "Circuit imprimé",
  [RecipesEnum.Alternate_Electrode_Circuit_Board]:
    "Circuit imprimé à électrodes (alternative)",
  [RecipesEnum.Alternate_Caterium_Circuit_Board]:
    "Circuit imprimé en caterium (alternative)",
  [RecipesEnum.Alternate_Silicon_Circuit_Board]:
    "Circuit imprimé en silicium (alternative)",
  // Fuel
  [RecipesEnum.Residual_Fuel]: "Carburant résiduel",
  [RecipesEnum.Fuel]: "Carburant",
  [RecipesEnum.Unpackage_Fuel]: "Carburant non conditionné",
  [RecipesEnum.Alternate_Diluted_Fuel]: "Carburant dilué (alternative)",
  // Packaged_Fuel
  [RecipesEnum.Packaged_Fuel]: "Carburant conditionné",
  [RecipesEnum.Alternate_Diluted_Packaged_Fuel]:
    "Carburant dilué conditionné (alternative)",
  // Heavy_Oil_Residue
  [RecipesEnum.Alternate_Heavy_Oil_Residue]:
    "Résidus de pétrole lourd (alternative)",
  [RecipesEnum.Unpackage_Heavy_Oil_Residue]:
    "Résidus de pétrole lours non conditionné",
  // Packaged_Heavy_Oil_Residue
  [RecipesEnum.Packaged_Heavy_Oil_Residue]:
    "Résidus de pétrole lourd non conditionnés",
  // Liquid_Biofuel
  [RecipesEnum.Liquid_Biofuel]: "Biocarburant liquide",
  [RecipesEnum.Unpackage_Liquid_Biofuel]:
    "Biocarburant liquide non conditionné",
  // Packaged_Liquid_Biofuel
  [RecipesEnum.Packaged_Liquid_Biofuel]: "Biocarburant liquide conditionné",
  // Empty_Canister
  [RecipesEnum.Empty_Canister]: "Bidon vide",
  [RecipesEnum.Alternate_Steel_Canister]: "Bidon en acier (alternative)",
  [RecipesEnum.Alternate_Coated_Iron_Canister]:
    "Bidon en fer recouvert (alternative)",

  // ========== Tier 6 items ==========
  // Computer
  [RecipesEnum.Computer]: "Ordinateur",
  [RecipesEnum.Alternate_Crystal_Computer]:
    "Ordinateur à cristaux (alternative)",
  [RecipesEnum.Alternate_Caterium_Computer]:
    "Ordinateur en caterium (alternative)",
  // Heavy_Modular_Frame
  [RecipesEnum.Heavy_Modular_Frame]: "Cadre modulaire lourd",
  [RecipesEnum.Alternate_Heavy_Encased_Frame]:
    "Cadre de protection lourd (alternative)",
  [RecipesEnum.Alternate_Heavy_Flexible_Frame]:
    "Cadre flexible lourd (alternative)",
  // Modular_Engine
  [RecipesEnum.Modular_Engine]: "Moteur modulaire",
  // Adaptive_Control_Unit
  [RecipesEnum.Adaptive_Control_Unit]: "Unité de contrôle adaptative",

  // ========== Tier 7 items ==========
  // Alumina_Solution
  [RecipesEnum.Alumina_Solution]: "Solution d'alumine",
  [RecipesEnum.Unpackage_Alumina_Solution]:
    "Solution d'alumine non conditionnée",
  [RecipesEnum.Alternate_Sloppy_Alumina]: "Alumine bâclée (alternative)",
  // Packaged_Alumina_Solution
  [RecipesEnum.Packaged_Alumina_Solution]: "Solution d'aluminium conditionnée",
  // Aluminum_Scrap
  [RecipesEnum.Aluminum_Scrap]: "Rebuts d'aluminium",
  [RecipesEnum.Alternate_Instant_Scrap]: "Rebut instantané (alternative)",
  [RecipesEnum.Alternate_Electrode_Aluminum_Scrap]:
    "Électrode en rebuts d'aluminium (alternative)",
  // Aluminum_Ingot
  [RecipesEnum.Aluminum_Ingot]: "Lingot d'aluminium",
  [RecipesEnum.Alternate_Pure_Aluminum_Ingot]:
    "Lingot d'aluminium pur (alternative)",
  // Alclad_Aluminum_Sheet
  [RecipesEnum.Alclad_Aluminum_Sheet]: "Tôle d'aluminium en alliage Alclad",
  // Aluminum_Casing
  [RecipesEnum.Aluminum_Casing]: "Boîtiers en aluminium",
  [RecipesEnum.Alternate_Alclad_Casing]:
    "Boîtiers en alliage Alclad (alternative)",
  // Radio_Control_Unit
  [RecipesEnum.Radio_Control_Unit]: "Unité de contrôle radio",
  [RecipesEnum.Alternate_Radio_Connection_Unit]:
    "Unité de connexion radio (alternative)",
  [RecipesEnum.Alternate_Radio_Control_System]:
    "Système de contrôle radio (alternative)",
  // Sulfuric_Acid
  [RecipesEnum.Sulfuric_Acid]: "Acide sulfurique",
  [RecipesEnum.Unpackage_Sulfuric_Acid]: "Acide sulfurique non conditionné",
  // Packaged_Sulfuric_Acid
  [RecipesEnum.Packaged_Sulfuric_Acid]: "Acide sulfurique conditionné",
  // Battery
  [RecipesEnum.Battery]: "Batterie",
  [RecipesEnum.Alternate_Classic_Battery]: "Batterie classique (alternative)",
  // Supercomputer
  [RecipesEnum.Supercomputer]: "Superordinateur",
  [RecipesEnum.Alternate_OC_Supercomputer]:
    "Superordinateur surcadencé (alternative)",
  [RecipesEnum.Alternate_Super_State_Computer]:
    "Ordinateur à superétat (alternative)",
  // Assembly_Director_System
  [RecipesEnum.Assembly_Director_System]: "Système de directeur d'assemblage",

  // ========== Tier 8 items ==========
  // Encased_Uranium_Cell
  [RecipesEnum.Encased_Uranium_Cell]: "Cellule d'uranium",
  [RecipesEnum.Alternate_Infused_Uranium_Cell]:
    "Cellule d'uranium infusée (alternative)",
  // Electromagnetic_Control_Rod
  [RecipesEnum.Electromagnetic_Control_Rod]:
    "Tige de contrôle électromagnétique",
  [RecipesEnum.Alternate_Electromagnetic_Connection_Rod]:
    "Tige de connexion électromagnétique (alternative)",
  // Uranium_Fuel_Rod
  [RecipesEnum.Uranium_Fuel_Rod]: "Barre d'uranium",
  [RecipesEnum.Alternate_Uranium_Fuel_Unit]: "Unité d'uranium (alternative)",
  // Magnetic_Field_Generator
  [RecipesEnum.Magnetic_Field_Generator]: "Générateur de champ magnétique",
  // Empty_Fluid_Tank
  [RecipesEnum.Empty_Fluid_Tank]: "Réservoir vide",
  // Heat_Sink
  [RecipesEnum.Alternate_Heat_Exchanger]: "Échangeur thermique (alternative)",
  [RecipesEnum.Heat_Sink]: "Dissipateur de chaleur",
  // Cooling_System
  [RecipesEnum.Cooling_System]: "Système de refroidissement",
  [RecipesEnum.Alternate_Cooling_Device]: "Refroidisseur (alternative)",
  // Fused_Modular_Frame
  [RecipesEnum.Fused_Modular_Frame]: "Cadre modulaire fusionné",
  [RecipesEnum.Alternate_Heat_Fused_Frame]:
    "Cadre fusionné à chaud (alternative)",
  // Turbo_Motor
  [RecipesEnum.Turbo_Motor]: "Turbomoteur",
  [RecipesEnum.Alternate_Turbo_Pressure_Motor]:
    "Turbomoteur pressurisé (alternative)",
  [RecipesEnum.Alternate_Turbo_Electric_Motor]:
    "Turbomoteur électrique (alternative)",
  // Thermal_Propulsion_Rocket
  [RecipesEnum.Thermal_Propulsion_Rocket]: "Fusée à propulsion thermique",
  // Nitric_Acid
  [RecipesEnum.Nitric_Acid]: "Acide nitrique",
  [RecipesEnum.Unpackage_Nitric_Acid]: "Acide nitrique non conditionné",
  // Packaged_Nitric_Acid
  [RecipesEnum.Packaged_Nitric_Acid]: "Acide nitrique conditionné",
  // Non_Fissile_Uranium
  [RecipesEnum.Non_Fissile_Uranium]: "Uranium non fissile",
  [RecipesEnum.Alternate_Fertile_Uranium]: "Uranium fertile (alternative)",
  // Plutonium_Pellet
  [RecipesEnum.Plutonium_Pellet]: "Granulés de plutonium",
  // Encased_Plutonium_Cell
  [RecipesEnum.Encased_Plutonium_Cell]: "Cellule de plutonium encastré",
  [RecipesEnum.Alternate_Instant_Plutonium_Cell]:
    "Cellule de plutonium instantanée (alternative)",
  // Plutonium_Fuel_Rod
  [RecipesEnum.Plutonium_Fuel_Rod]: "Barre de plutonium",
  [RecipesEnum.Alternate_Plutonium_Fuel_Unit]:
    "Unité de plutonium (alternative)",
  // Copper_Powder
  [RecipesEnum.Copper_Powder]: "Poudre de cuivre",
  // Pressure_Conversion_Cube
  [RecipesEnum.Pressure_Conversion_Cube]: "Cube de conversion de pression",
  // Nuclear_Pasta
  [RecipesEnum.Nuclear_Pasta]: "Pâte nucléaire",

  // ========== Tier 9 items ==========
  // Diamonds
  [RecipesEnum.Diamonds]: "Diamants",
  [RecipesEnum.Alternate_Petroleum_Diamonds]:
    "Diamants de pétrole (alternative)",
  [RecipesEnum.Alternate_Oil_Based_Diamonds]:
    "Diamants à base de pétrole (alternative)",
  [RecipesEnum.Alternate_Pink_Diamonds]: "Diamants roses (alternative)",
  [RecipesEnum.Alternate_Cloudy_Diamonds]: "Diamants laiteux (alternative)",
  [RecipesEnum.Alternate_Turbo_Diamonds]: "Diamants turbo (alternative)",
  // Time_Crystal
  [RecipesEnum.Time_Crystal]: "Cristal temporel",
  // Ficsite_Ingot
  [RecipesEnum.Ficsite_Ingot_Iron]: "Lingot de ficsite (fer)",
  [RecipesEnum.Ficsite_Ingot_Aluminum]: "Lingot de ficsite (aluminium)",
  [RecipesEnum.Ficsite_Ingot_Caterium]: "Lingot de ficsite (caterium)",
  // Ficsite_Trigon
  [RecipesEnum.Ficsite_Trigon]: "Trigon en ficsite",
  // Biochemical_Sculptor
  [RecipesEnum.Biochemical_Sculptor]: "Sculptrice biochimique",
  // Excited_Photonic_Matter
  [RecipesEnum.Excited_Photonic_Matter]: "Matière photonique agitée",
  // Dark_Matter_Residue
  [RecipesEnum.Dark_Matter_Residue]: "Résidus de matière noire",
  // Dark_Matter_Crystal
  [RecipesEnum.Dark_Matter_Crystal]: "Cristal de matière noire",
  [RecipesEnum.Alternate_Dark_Matter_Crystallization]:
    "Matière noire cristallisée (alternative)",
  [RecipesEnum.Alternate_Dark_Matter_Trap]:
    "Piège à matière noire (alternative)",
  // Superposition_Oscillator
  [RecipesEnum.Superposition_Oscillator]: "Oscillateur de superposition",
  // Neural_Quantum_Processor
  [RecipesEnum.Neural_Quantum_Processor]: "Processeur neuro-quantique",
  // AI_Expansion_Server
  [RecipesEnum.AI_Expansion_Server]: "Serveur d'expansion d'I.A.",
  // Singularity_Cell
  [RecipesEnum.Singularity_Cell]: "Cellule de singularité",
  // Ballistic_Warp_Drive
  [RecipesEnum.Ballistic_Warp_Drive]: "Moteur à distorsion balistique",
  // Ficsonium
  [RecipesEnum.Ficsonium]: "Ficsonium",
  // Ficsonium_Fuel_Rod
  [RecipesEnum.Ficsonium_Fuel_Rod]: "Barre de ficsonium",

  // =========== MAM items ============
  // Power_Shard
  [RecipesEnum.Power_Shard_Blue_Power_Slug]: "Éclat de charge (x1)",
  [RecipesEnum.Power_Shard_Yellow_Power_Slug]: "Éclat de charge (x2)",
  [RecipesEnum.Power_Shard_Purple_Power_Slug]: "Éclat de charge (x5)",
  [RecipesEnum.Synthetic_Power_Shard]: "Éclat de charge synthétique",
  // Alien_Protein
  [RecipesEnum.Alien_Protein_Spitter]: "Protéine de cracheur",
  [RecipesEnum.Alien_Protein_Hog]: "Protéine de sanglier extraterrestre",
  [RecipesEnum.Alien_Protein_Stinger]: "Protéine de dardeuse",
  [RecipesEnum.Alien_Protein_Hatcher]: "Protéine d'écloseur",
  // Alien_DNA_Capsule
  [RecipesEnum.Alien_DNA_Capsule]: "Capsule ADN extraterrestre",
  // Fabric
  [RecipesEnum.Fabric]: "Tissu",
  [RecipesEnum.Alternate_Polyester_Fabric]: "Tissu en polyester (alternative)",
  // Caterium_Ingot
  [RecipesEnum.Caterium_Ingot]: "Lingot de caterium",
  [RecipesEnum.Alternate_Pure_Caterium_Ingot]:
    "Lingot de caterium pur (alternative)",
  [RecipesEnum.Alternate_Tempered_Caterium_Ingot]:
    "Lingot de caterium trempé (alternative)",
  [RecipesEnum.Alternate_Leached_Caterium_Ingot]:
    "Lingot de caterium lessivé (alternative)",
  // Quickwire
  [RecipesEnum.Quickwire]: "Filactif",
  [RecipesEnum.Alternate_Fused_Quickwire]: "Filactif fusionné (alternative)",
  // AI_Limiter
  [RecipesEnum.AI_Limiter]: "Contrôleur d'I.A.",
  [RecipesEnum.Alternate_Plastic_AI_Limiter]: "Contrôleur d'I.A. en plastique",
  // High_Speed_Connector
  [RecipesEnum.High_Speed_Connector]: "Connecteur haute vitesse",
  [RecipesEnum.Alternate_Silicon_High_Speed_Connector]:
    "Connecteur haute vitesse en silicium (alternative)",
  // Quartz_Crystal
  [RecipesEnum.Quartz_Crystal]: "Cristal de quartz",
  [RecipesEnum.Alternate_Pure_Quartz_Crystal]:
    "Cristal de quartz pur (alternative)",
  [RecipesEnum.Alternate_Fused_Quartz_Crystal]:
    "Cristal de quartz fusionné (alternative)",
  // Silica
  [RecipesEnum.Silica]: "Silice",
  [RecipesEnum.Alternate_Cheap_Silica]: "Silice bon marché (alternative)",
  [RecipesEnum.Alternate_Distilled_Silica]: "Silice distillée (alternative)",
  // Crystal_Oscillator
  [RecipesEnum.Crystal_Oscillator]: "Oscillateur à cristal",
  [RecipesEnum.Alternate_Insulated_Crystal_Oscillator]:
    "Oscillateur à cristal isolé (alternative)",
  // Dissolved_Silica
  [RecipesEnum.Alternate_Quartz_Purification]: "Quartz purifié (alternative)",
  // Black_Powder
  [RecipesEnum.Black_Powder]: "Poudre noire",
  [RecipesEnum.Alternate_Fine_Black_Powder]: "Poudre noire fine (alternative)",
  // Compacted_Coal
  [RecipesEnum.Alternate_Compacted_Coal]: "Charbon compacté (alternative)",
  // Turbofuel
  [RecipesEnum.Turbofuel]: "Turbocarburant",
  [RecipesEnum.Unpackage_Turbofuel]: "Turbocarburant non conditionné",
  [RecipesEnum.Alternate_Turbo_Heavy_Fuel]:
    "Turbocarburant lourd (alternative)",
  [RecipesEnum.Alternate_Turbo_Blend_Fuel]:
    "Turbocarburant mélangé (alternative)",
  // Packaged_Turbofuel
  [RecipesEnum.Packaged_Turbofuel]: "Turbocarburant conditionné",
  // Smokeless_Powder
  [RecipesEnum.Smokeless_Powder]: "Poudre sans fumée",
  // Rocket_Fuel
  [RecipesEnum.Rocket_Fuel]: "Carburant de fusée",
  [RecipesEnum.Unpackage_Rocket_Fuel]: "Carburant de fusée non conditionné",
  [RecipesEnum.Alternate_Nitro_Rocket_Fuel]: "Carburant de fusée (alternative)",
  // Packaged_Rocket_Fuel
  [RecipesEnum.Packaged_Rocket_Fuel]: "Carburant de fusée conditionné",
  // Ionized_Fuel
  [RecipesEnum.Ionized_Fuel]: "Carburant ionisé",
  [RecipesEnum.Unpackage_Ionized_Fuel]: "Carburant ionisé non conditionné",
  [RecipesEnum.Alternate_Dark_Ion_Fuel]: "Carburant d'ions noirs (alternative)",
  // Packaged_Ionized_Fuel
  [RecipesEnum.Packaged_Ionized_Fuel]: "Carburant ionisé conditionné",
  // Reanimated_SAM
  [RecipesEnum.Reanimated_SAM]: "É.M.E. réanimée",
  // SAM_Fluctuator
  [RecipesEnum.SAM_Fluctuator]: "Fluctuateur d'É.M.E.",
  // Alien_Power_Matrix
  [RecipesEnum.Alien_Power_Matrix]: "Matrice de charge extraterrestre",

  // = Classic Automatable equipments =
  // Portable_Miner
  [RecipesEnum.Alternate_Automated_Miner]: "Foreuse automatisée (alternative)",
  // Gas_Filter
  [RecipesEnum.Gas_Filter]: "Filtre à gaz",
  // Iodine_Infused_Filter
  [RecipesEnum.Iodine_Infused_Filter]: "Filtre à infusion d'iode",

  // === MAM Automatable equipments ===
  // Iron_Rebar
  [RecipesEnum.Iron_Rebar]: "Barre d'armature en fer",
  // Stun_Rebar
  [RecipesEnum.Stun_Rebar]: "Barre d'armature étourdissante",
  // Shatter_Rebar
  [RecipesEnum.Shatter_Rebar]: "Barre d'armature à fragmentation",
  // Explosive_Rebar
  [RecipesEnum.Explosive_Rebar]: "Fer explosif",
  // Nobelisk
  [RecipesEnum.Nobelisk]: "Nobélisque",
  // Gas_Nobelisk
  [RecipesEnum.Gas_Nobelisk]: "Nobélisque à gaz",
  // Pulse_Nobelisk
  [RecipesEnum.Pulse_Nobelisk]: "Nobélisque à impulsion",
  // Cluster_Nobelisk
  [RecipesEnum.Cluster_Nobelisk]: "Nobélisque à fragmentation",
  // Nuke_Nobelisk
  [RecipesEnum.Nuke_Nobelisk]: "Nobélisque nucléaire",
  // Rifle_Ammo
  [RecipesEnum.Rifle_Ammo]: "Munition de fusil",
  // Homing_Rifle_Ammo
  [RecipesEnum.Homing_Rifle_Ammo]: "Munitions de fusil à têtes chercheuses",
  // Turbo_Rifle_Ammo
  [RecipesEnum.Turbo_Rifle_Ammo]: "Munitions de fusil turbo",
  [RecipesEnum.Packaged_Turbo_Rifle_Ammo]: "Munitions de fusil turbo",

  // ======= Generators recipes =======
  // Biomass_Burner
  [RecipesEnum.Biomass_Burner_Leaves]: "Brûleur de biomasse (Feuilles)",
  [RecipesEnum.Biomass_Burner_Mycelia]: "Brûleur de biomasse (Mycélium)",
  [RecipesEnum.Biomass_Burner_Wood]: "Brûleur de biomasse (Bois)",
  [RecipesEnum.Biomass_Burner_Biomass]: "Brûleur de biomasse (Biomasse)",
  [RecipesEnum.Biomass_Burner_Solid_Biofuel]:
    "Brûleur de biomasse (Biocarburant solide)",
  [RecipesEnum.Biomass_Burner_Packaged_Liquid_Biofuel]:
    "Brûleur de biomasse (Biocarburant liquide conditionné)",
  // Coal_Powered_Generator
  [RecipesEnum.Coal_Powered_Generator_Coal]: "Générateur à charbon (Charbon)",
  [RecipesEnum.Coal_Powered_Generator_Compacted_Coal]:
    "Générateur à charbon (Charbon compacté)",
  [RecipesEnum.Coal_Powered_Generator_Petroleum_Coke]:
    "Générateur à charbon (Coke de pétrole)",
  // Fuel_Powered_Generator
  [RecipesEnum.Fuel_Powered_Generator_Fuel]:
    "Générateur à carburant (Carburant)",
  [RecipesEnum.Fuel_Powered_Generator_Liquid_Biofuel]:
    "Générateur à carburant (Biocarburant liquide)",
  [RecipesEnum.Fuel_Powered_Generator_Turbofuel]:
    "Générateur à carburant (Turbocarburant)",
  [RecipesEnum.Fuel_Powered_Generator_Rocket_Fuel]:
    "Générateur à carburant (Carburant de fusée)",
  [RecipesEnum.Fuel_Powered_Generator_Ionized_Fuel]:
    "Générateur à carburant (Carburant ionisé)",
  // Nuclear_Power_Plant
  [RecipesEnum.Nuclear_Power_Plant_Uranium_Fuel_Rod]:
    "Centrale nucléaire (Barre d'uranium)",
  [RecipesEnum.Nuclear_Power_Plant_Plutonium_Fuel_Rod]:
    "Centrale nucléaire (Barre de plutonium)",
  [RecipesEnum.Nuclear_Power_Plant_Ficsonium_Fuel_Rod]:
    "Centrale nucléaire (Barre de ficsonium)",

  // ========= FICSMAS items ==========
  // FICSMAS_Tree_Branch
  [RecipesEnum.FICSMAS_Tree_Branch]: "Branche d'arbre FICSMAS",
  // Red_FICSMAS_Ornament
  [RecipesEnum.Red_FICSMAS_Ornament]: "Décoration FICSMAS rouge",
  // Blue_FICSMAS_Ornament
  [RecipesEnum.Blue_FICSMAS_Ornament]: "Décoration FICSMAS bleue",
  // Copper_FICSMAS_Ornament
  [RecipesEnum.Copper_FICSMAS_Ornament]: "Décoration FICSMAS en cuivre",
  // Iron_FICSMAS_Ornament
  [RecipesEnum.Iron_FICSMAS_Ornament]: "Décoration FICSMAS en fer",
  // FICSMAS_Wreath
  [RecipesEnum.FICSMAS_Wreath]: "Couronne FICSMAS",
  // FICSMAS_Ornament_Bundle
  [RecipesEnum.FICSMAS_Ornament_Bundle]: "Lot d'ornements FICSMAS",
  // Candy_Cane
  [RecipesEnum.Candy_Cane]: "Sucre d'orge",
  // FICSMAS_Bow
  [RecipesEnum.FICSMAS_Bow]: "Nœud de FICSMAS",
  // FICSMAS_Actual_Snow
  [RecipesEnum.FICSMAS_Actual_Snow]: "Vraie neige de FICSMAS",
  // FICSMAS_Wonder_Star
  [RecipesEnum.FICSMAS_Wonder_Star]: "Étoile merveilleuse FICSMAS",
  // Snowball
  [RecipesEnum.Snowball]: "Boule de neige",
};
