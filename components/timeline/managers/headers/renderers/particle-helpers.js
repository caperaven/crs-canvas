export function moveParticle(system, particle, key, position,  xOffset, yOffset, scale) {
    const next_position_x = position + xOffset

    const index = system.getIndex(key, next_position_x);

    if (index != null && particle.idxInShape !== index) return;

    particle.position.x = next_position_x;
    particle.position.y = yOffset;
    particle.isUsed = true;

    if(scale != null) {
        particle.scaling = scale;
    }

    system.set(key, particle.idxInShape, next_position_x);
}