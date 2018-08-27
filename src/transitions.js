import bitsy from "bitsy";
import {
	hackOptions,
	glazy
} from "./canvas replacement";
var room;
hackOptions.disableFeedbackTexture = false;
hackOptions.init = function() {
	room = bitsy.curRoom;

	// hack textureFeedback update
	// so we can update it as-needed rather than every frame
	glazy.textureFeedback.oldUpdate = glazy.textureFeedback.update;
	glazy.textureFeedback.update = function(){};
};
hackOptions.update = function() {
	// check for transition
	var r = bitsy.curRoom;
	if (room !== r) {
		// transition occurred; update feedback texture to capture frame
		room = r;
		glazy.textureFeedback.oldUpdate();
	}
};

