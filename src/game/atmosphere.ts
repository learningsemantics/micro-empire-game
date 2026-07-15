export type DayPhase = "morning" | "afternoon" | "evening" | "night";
export type Soundscape = {
  name: string;
  icon: string;
  frequencies: number[];
  tempo: number;
};

export function dayPhase(hour: number): DayPhase {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function soundscapeFor(
  weather: string,
  hour: number,
  cityView: boolean,
): Soundscape {
  if (weather === "rain")
    return {
      name: "Rain on Toronto streets",
      icon: "☂",
      frequencies: [196, 220, 196],
      tempo: 1.6,
    };
  if (weather === "snow")
    return {
      name: "Quiet snowfall",
      icon: "✦",
      frequencies: [330, 392, 440],
      tempo: 2.2,
    };
  if (weather === "heat")
    return {
      name: "Summer city hum",
      icon: "☀",
      frequencies: [130, 146, 164],
      tempo: 1.8,
    };
  if (dayPhase(hour) === "evening" || dayPhase(hour) === "night")
    return {
      name: "Toronto after dark",
      icon: "☾",
      frequencies: [220, 277, 330],
      tempo: 2,
    };
  return cityView
    ? {
        name: "Downtown rhythm",
        icon: "▥",
        frequencies: [262, 330, 392],
        tempo: 1.4,
      }
    : {
        name: "Neighbourhood workspace",
        icon: "♫",
        frequencies: [294, 349, 440],
        tempo: 1.7,
      };
}

export function safeVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}
