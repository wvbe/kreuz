import Color from 'color';

export const color: Record<string, Color> = {};
color.background = Color('#cde1fc');
color.white = Color('#fff');
color.terrain = Color('#a1d83c');
color.beach = Color('#f7d884');
color.highlightedTerrain = color.terrain.lighten(1);
color.terrainStroke = color.terrain.darken(0.5).saturate(0.3);
