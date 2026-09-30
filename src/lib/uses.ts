import { getEntry } from 'astro:content';

export async function getUses() {
  const entry = await getEntry('uses', 'uses');
  if (!entry) {
    throw new Error(
      'No se ha podido cargar src/data/uses.yaml: revisa el terminal (formato o esquema). En desarrollo, reinicia el servidor.',
    );
  }
  return entry.data;
}
