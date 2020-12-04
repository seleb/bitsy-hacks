/**
↔
@file directional avatar
@summary edit the player's sprite based on directional movement
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Edits the player's sprite based on directional movement.

```curlicue
{FN {BTN}
	{IF
		{IS BTN "OK"}
			{>> }
		{: THIS TIL {ADD "AVA_" BTN}}
	}
}
```

To only use a subset of directions,
more branches can be added to filter out others.

e.g. To only use horizontal sprites:

```curlicue
{FN {BTN}
	{IF
		{IS BTN "OK"}
			{>> }
		{IS BTN "UP"}
			{>> }
		{IS BTN "DWN"}
			{>> }
		{: THIS TIL {ADD "AVA_" BTN}}
	}
}
```

HOW TO USE:
1. Copy-paste the curlicue script into a dialog
2. Attach the dialog to the avatar's "on button" hook
3. Add a sprite for each direction
4. Edit the sprites' IDs (not their names) to be "AVA_UP", "AVA_DWN", "AVA_LFT", "AVA_RGT"
*/
