/**
💕
@file follower
@summary make a sprite follow the player
@license MIT
@version auto
@requires 8.0
@author Sean S. LeBlanc

@description
Make a sprite follow the player.

Avatar on button script (note that the top IF block is just setting a default follower of "2" and can be removed/modified):

```curlicue
{FN {BTN}
	{IF
		{IS {: THIS follower} NO}
			{>> {: THIS follower "2"}}
	}
	{IF
		{ISNT BTN "OK"}
			{>>
				{SET X {: THIS X}}
				{SET Y {: THIS Y}}
				{PUT {: THIS follower} X Y}
			}
	}
}
```

Follower on button script:

```curlicue
{FN {BTN}
	{IF
		{IS BTN "OK"}
			{>>}
		{IS {: THIS placed} YES}
			{>>
				{RID THIS}
			}
		{>>
			{: THIS placed YES}
		}
	}
}
```

Follower dialog (without this, the follower walk onto the player after talking to them):

```curlicue
{: THIS placed NO}
I'm a follower
```

HOW TO USE:
1. Copy-paste the curlicue scripts into dialogs
2. Attach the first script to the avatar's "on button" hook
3. Attach the second script to any follower sprite's "on button" hook
4. Include the third script in any follower sprite's dialog
5. Use other scripts as needed to modify the follower
*/
