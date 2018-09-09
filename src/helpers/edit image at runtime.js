/**
@file edit image at runtime
@summary API for updating image data at runtime.
@author Sean S. LeBlanc
@description
Adds API for updating sprite, tile, and item data at runtime.

Individual frames of image data in bitsy are 8x8 1-bit 2D arrays in yx order
e.g. the default player is:
[
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,0,1,1,0,0,0],
	[0,0,1,1,1,1,0,0],
	[0,1,1,1,1,1,1,0],
	[1,0,1,1,1,1,0,1],
	[0,0,1,0,0,1,0,0],
	[0,0,1,0,0,1,0,0]
]
*/
import bitsy from "bitsy";
import {
	getImage
} from "./utils";

export {
	getImage
};

/*
Args:
	   id: string id or name
	frame: animation frame (0 or 1)
	  map: map of images (e.g. `sprite`, `tile`, `item`)

Returns: a single frame of a image data
*/
export function getImageData(id, frame, map) {
	return bitsy.renderer.GetImageSource(getImage(id, map).drw)[frame];
}

export function getSpriteData(id, frame) {
	return getImageData(id, frame, bitsy.sprite);
}

export function getTileData(id, frame) {
	return getImageData(id, frame, bitsy.tile);
}

export function getItemData(id, frame) {
	return getImageData(id, frame, bitsy.item);
}

/*
Updates a single frame of image data

Args:
	     id: string id or name
	  frame: animation frame (0 or 1)
	    map: map of images (e.g. `sprite`, `tile`, `item`)
	newData: new data to write to the image data
*/
export function setImageData(id, frame, map, newData) {
	var drawing = getImage(id, map);
	var drw = drawing.drw;
	var img = bitsy.renderer.GetImageSource(drw);
	img[frame] = newData;
	bitsy.renderer.SetImageSource(drw, img);
}

export function setSpriteData(id, frame, newData) {
	setImageData(id, frame, bitsy.sprite, newData);
}

export function setTileData(id, frame, newData) {
	setImageData(id, frame, bitsy.tile, newData);
}

export function setItemData(id, frame, newData) {
	setImageData(id, frame, bitsy.item, newData);
}