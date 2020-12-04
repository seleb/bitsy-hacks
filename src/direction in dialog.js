/**
🔝
@file direction in dialog
@summary provides a variable with player direction
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Provides a variable "playerDirection" that can be accessed in dialog
The value will be one of:
	- "UP"
	- "DWN"
	- "LFT"
	- "RGT"
Depending on the last input from the player.

Note that the variable will describe the direction the player moved,
so if they're interacting with a sprite, the opposite will be the direction from which they came
i.e. if the player moves into a sprite from the left, the variable will be "right"

```curlicue
{FN {BTN}
	{IF
		{IS BTN "OK"}
			{>> }
		{SET DIR BTN}
	}
}
```

Example use:

```curlicue
{>>
	{IF
		{IS DIR "RGT"}
			{>> i'm a cat to the right of you}
		{IS DIR "LFT"}
			{>> i'm a cat to the left of you}
		{IS DIR "UP"}
			{>> i'm a cat above you}
		{IS DIR "DWN"}
			{>> i'm a cat below you}
	}
}
```

HOW TO USE:
1. Copy-paste the curlicue script into a script
2. Attach the scripts to the avatar's "on button" hook
3. Use variable as needed in other scripts
*/
