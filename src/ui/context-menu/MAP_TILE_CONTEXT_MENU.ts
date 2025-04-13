import { createContextMenu } from '../components/createContextMenu';
import { MapTileContextMenu } from './MapTileContextMenu';

const contextMenu = createContextMenu(MapTileContextMenu);

export const MapTileContextMenuHost = contextMenu.Host;
export const useMapTileContextMenu = contextMenu.use;
