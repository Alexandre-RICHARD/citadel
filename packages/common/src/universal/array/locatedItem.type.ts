// Élément et sa place dans la liste : de quoi le remettre au même endroit après une suppression annulée
export type LocatedItem<Item> = { item: Item; index: number };
