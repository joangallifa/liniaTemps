export type SteepKey =
  | "steep_social"
  | "steep_tecnologic"
  | "steep_economic"
  | "steep_ecologic"
  | "steep_politic";

// Anàlisi STEEP: Social, Tecnològic, Econòmic, Ecològic, Polític.
export const STEEP_FIELDS: { key: SteepKey; label: string; placeholder: string }[] = [
  {
    key: "steep_social",
    label: "Social",
    placeholder: "Com va canviar la manera de relacionar-se o viure de les persones?",
  },
  {
    key: "steep_tecnologic",
    label: "Tecnològic",
    placeholder: "Quin avenç tècnic va suposar respecte al que ja existia?",
  },
  {
    key: "steep_economic",
    label: "Econòmic",
    placeholder: "Com va afectar la producció, el comerç o els llocs de treball?",
  },
  {
    key: "steep_ecologic",
    label: "Ecològic",
    placeholder: "Quin impacte va tenir sobre els recursos o el medi ambient?",
  },
  {
    key: "steep_politic",
    label: "Polític",
    placeholder: "Com va influir en el poder, les lleis o les relacions entre estats?",
  },
];
