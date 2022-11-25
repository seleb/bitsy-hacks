import { evaluate, start, startDialog, waitForFrame } from './test/bitsy';

test('twine-bitsy-comms', async () => {
	await start({
		title: '',
		hacks: [
			[
				'twine-bitsy-comms',
				{
					variableNameOut: function (name) {
						return 'bitsy_' + name;
					},
					itemNameOut: function (id) {
						return 'bitsy_item_' + (window.item[id].name || id);
					},
					variableNameIn: function (name) {
						return 'twine_' + name;
					},
					send: function (type, data) {
						window.messages = window.messages || [];
						window.messages.push({ type, data });
					},
					receive: function () {
						window.receiveMessage = (type, data) => {
							// eslint-disable-next-line no-undef
							receiveMessage(type, data);
						};
					},
				},
			],
		],
	});
	await waitForFrame();
	await evaluate(() =>
		window.receiveMessage('variables', {
			externalvar: 'value',
		})
	);
	await startDialog('{twinePlay "passage"}');
	await startDialog('{twineBack}');
	await startDialog('{twineEval "js"}');
	expect(await evaluate(() => Object.fromEntries(window.scriptInterpreter.GetVariableNames().map(i => [i, window.scriptInterpreter.GetVariable(i)])))).toMatchInlineSnapshot(`
		{
		  "a": 42,
		  "twine_externalvar": "value",
		}
	`);
	expect(await evaluate(() => window.messages)).toMatchInlineSnapshot(`
		[
		  {
		    "data": {
		      "name": "bitsy_a",
		      "value": 42,
		    },
		    "type": "variable",
		  },
		  {
		    "data": {
		      "name": "bitsy_item_tea",
		      "value": 0,
		    },
		    "type": "variable",
		  },
		  {
		    "data": {
		      "name": "bitsy_item_key",
		      "value": 0,
		    },
		    "type": "variable",
		  },
		  {
		    "type": "start",
		  },
		  {
		    "data": "passage",
		    "type": "play",
		  },
		  {
		    "type": "back",
		  },
		  {
		    "data": "js",
		    "type": "eval",
		  },
		]
	`);
});
