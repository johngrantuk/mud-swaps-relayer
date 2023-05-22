import worldsJson from "../../contracts/worlds.json";

export function getWorldAddress(): string {
    const worlds = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;
    const world = worlds['31337'];
    if(!world) throw Error('No World Address');
    return world.address;
}