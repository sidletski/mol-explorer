import { PluginConfig } from 'molstar/lib/mol-plugin/config'
import { PluginContext } from 'molstar/lib/mol-plugin/context'
import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec'
import { type Color } from 'molstar/lib/mol-util/color'
import { type FC, useEffect, useRef } from 'react'

import styles from './MolViewer.module.scss'
import { loadStructure } from './utils'

type MolViewerProps = {
  pdbId: string
}

export const MolViewer: FC<MolViewerProps> = ({ pdbId }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pluginRef = useRef<PluginContext | null>(null)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const controller = new AbortController()

    const init = async () => {
      const spec = DefaultPluginSpec()
      spec.config = spec.config || []
      spec.config.push([PluginConfig.VolumeStreaming.Enabled, false])

      const plugin = new PluginContext(spec)
      await plugin.init()

      if (controller.signal.aborted) {
        plugin.dispose()
        return
      }

      await plugin.initViewerAsync(canvasRef.current!, containerRef.current!)

      plugin.canvas3d?.setProps({
        renderer: { backgroundColor: 0xf1f1f1 as unknown as Color }
      })

      pluginRef.current = plugin
      await loadStructure(plugin, pdbId)
      initialLoadDone.current = true
    }

    init()

    return () => {
      controller.abort()
      pluginRef.current?.dispose()
      pluginRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!pluginRef.current || !initialLoadDone.current) return

    pluginRef.current.clear().then(() => {
      if (pluginRef.current) {
        loadStructure(pluginRef.current, pdbId)
      }
    })
  }, [pdbId])

  return (
    <div ref={containerRef} className={styles.viewer}>
      <canvas ref={canvasRef} />
    </div>
  )
}
