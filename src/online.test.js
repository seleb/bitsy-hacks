import { rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { delay, evaluate, press, snapshot, start, waitForBlip, walkToCat } from './test/bitsy';

const clientfile = resolve(__dirname, './test/client.js');

beforeAll(async () => {
	await writeFile(
		clientfile,
		`
class Client {
	static log = [];
	handlers = {};
	constructor({ host, room }) {
		this.host = host;
		this.room = room;

		setTimeout(() => {
			const e = new Event('data');
			e.from = 'a';
			e.data = {
				e: 'move',
				x: 9,
				y: 12,
				room: '0',
			};
			this.handlers.data(e);
		}, 1000);

		setTimeout(() => {
			const e = new Event('data');
			e.from = 'mock';
			e.data = {
				e: 'move',
				x: 8,
				y: 12,
				room: '0',
			};
			this.handlers.data(e);
		}, 1500);
	}

	on(name, cb) {
		this.handlers[name] = cb;
	}

	broadcast(event) {
		Client.log.push(['broadcast', event]);
	}

	send(from, event) {
		Client.log.push([from, event]);
		if (event.e === 'gimmeSprite') {
			const e = new Event('data');
			e.from = 'mock';
			e.data = {
				e: 'sprite',
				col: 1,
				bgc: 0,
				x: 8,
				y: 12,
				room: '0',
				dlg: 'i am online',
				data: [[
					[0,0,0,0,1,1,1,1],
					[0,0,0,0,1,1,1,1],
					[0,0,0,0,1,1,1,1],
					[0,0,0,0,1,1,1,1],
					[1,1,1,1,0,0,0,0],
					[1,1,1,1,0,0,0,0],
					[1,1,1,1,0,0,0,0],
					[1,1,1,1,0,0,0,0]
				]],
			};
			this.handlers.data(e);
		}
	}

	setDebug(debug) {
		Client.log.push(['debug', debug]);
	}
}

window.Client = {
	default: Client,
	DATA: 'data',
	CLOSE: 'close',
};
`,
		{ encoding: 'utf8' }
	);
});

afterAll(async () => {
	await rm(clientfile);
});

test('online', async () => {
	await start({
		hacks: [
			[
				'online',
				{
					host: '.',
				},
			],
		],
	});
	await walkToCat();
	await snapshot();
	await delay(500);
	await snapshot();
	await delay(1000);
	await snapshot();
	await press('ArrowRight'); // start dialog
	await waitForBlip();
	await press('ArrowRight'); // complete dialog
	await snapshot();
	expect(await evaluate(() => window.Client.default.log)).toMatchInlineSnapshot(`
		[
		  [
		    "debug",
		    null,
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 5,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 6,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 7,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 8,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 9,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 10,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 11,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 4,
		      "y": 12,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 5,
		      "y": 12,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 6,
		      "y": 12,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 7,
		      "y": 12,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "bgc": 0,
		      "col": 2,
		      "data": [
		        [
		          [
		            0,
		            0,
		            0,
		            1,
		            1,
		            0,
		            0,
		            0,
		          ],
		          [
		            0,
		            0,
		            0,
		            1,
		            1,
		            0,
		            0,
		            0,
		          ],
		          [
		            0,
		            0,
		            0,
		            1,
		            1,
		            0,
		            0,
		            0,
		          ],
		          [
		            0,
		            0,
		            1,
		            1,
		            1,
		            1,
		            0,
		            0,
		          ],
		          [
		            0,
		            1,
		            1,
		            1,
		            1,
		            1,
		            1,
		            0,
		          ],
		          [
		            1,
		            0,
		            1,
		            1,
		            1,
		            1,
		            0,
		            1,
		          ],
		          [
		            0,
		            0,
		            1,
		            0,
		            0,
		            1,
		            0,
		            0,
		          ],
		          [
		            0,
		            0,
		            1,
		            0,
		            0,
		            1,
		            0,
		            0,
		          ],
		        ],
		      ],
		      "e": "sprite",
		      "room": "0",
		      "x": 7,
		      "y": 12,
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "gimmeSprite",
		    },
		  ],
		  [
		    "mock",
		    {
		      "e": "gimmeSprite",
		    },
		  ],
		  [
		    "broadcast",
		    {
		      "e": "move",
		      "room": "0",
		      "x": 7,
		      "y": 12,
		    },
		  ],
		]
	`);
});
