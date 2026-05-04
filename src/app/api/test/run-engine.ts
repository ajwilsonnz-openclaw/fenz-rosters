import { runAllocationEngine } from '../../../engine/allocation-engine-v2';

async function main() {
    console.log('--- TRIGGERING ALLOCATION ENGINE ---');
    const targetDate = '2026-05-15';
    const targetShift = 'Day';

    try {
        const result = await runAllocationEngine(targetDate, targetShift);
        if (result && Array.isArray(result)) {
            console.log(`Success! Found ${result.length} potential assignments.`);
        } else {
            console.log('Engine ran but no allocations were made. Check availability and requests.');
        }
    } catch (err) {
        console.error('Engine error:', err);
    }
}

main();
