import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export async function loadStructure(plugin: PluginContext, pdbId: string) {
  const url = `https://files.rcsb.org/download/${pdbId}.pdb`
  const data = await plugin.builders.data.download(
    { url, isBinary: false },
    { state: { isGhost: true } }
  )
  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    'pdb'
  )

  await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default')

  plugin.canvas3d?.requestCameraReset()
}
