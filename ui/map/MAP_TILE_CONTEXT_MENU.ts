import { createContextMenu } from '../components/createContextMenu.tsx';
import { MapTileContextMenu } from './MapTileContextMenu.tsx';

const contextMenu = createContextMenu(MapTileContextMenu);

export const MapTileContextMenuHost = contextMenu.Host;
export const useMapTileContextMenu = contextMenu.use;
