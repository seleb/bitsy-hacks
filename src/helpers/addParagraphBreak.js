/**
 * Helper for printing a paragraph break inside of a dialog function.
 * Adds the function `AddParagraphBreak` to `DialogBuffer`
 */
import {
	inject,
} from './kitsy-script-toolkit';

inject(/(this\.AddLinebreak = )/, 'this.AddParagraphBreak = function() { buffer.push( [[]] ); isActive = true; };\n$1');
