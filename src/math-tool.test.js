import { press, snapshot, start, walkToCat } from './test/bitsy';

test('math-tool', async () => {
    await start({
        catDialog: '{a = 42.5}Before: {print a}, (floor "a")after floor: {print a}; {a = 42.5}Before: {print a}, (ceil "a")after ceil: {print a};',
        hacks: ['math-tool'],
    });
    await walkToCat();
    await press('ArrowRight'); // talk to cat
    await press('ArrowRight'); // complete dialog page
    await snapshot();
});
