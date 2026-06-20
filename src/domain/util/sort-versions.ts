/**
 * Custom sorting function for dot-notated version strings
 */
export function sortVersionStrings(a: string, b: string): number {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    const maxParts = Math.max(aParts.length, bParts.length);

    for (let x = 0; x < maxParts; x++) {
        const currentA = aParts[x] ?? 0;
        const currentB = bParts[x] ?? 0;

        if (currentA !== currentB) {
            return currentA - currentB;
        }
    }

    return 0;
}

export default sortVersionStrings;