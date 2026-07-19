/// <reference types="youtube" />

import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '@/stores/playerStore'

let apiPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })

  return apiPromise
}

export function useYouTubePlayer(videoId: string | null) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const { setReady, setPlaying, isReady } = usePlayerStore()

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    ;(async () => {
      await loadYouTubeAPI()

      if (cancelled) return

      playerRef.current = new YT.Player(containerRef.current!, {
        height: '360',
        width: '640',
        playerVars: {
          controls: 0,
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: YT.OnStateChangeEvent) => {
            setPlaying(e.data === YT.PlayerState.PLAYING)
          },
          onError: (e: YT.OnErrorEvent) => {
            console.error('YouTube player error:', e.data, 'for video:', videoId)
          },
        },
      })
    })()

    return () => {
      cancelled = true
      clearTimer()
      playerRef.current?.destroy()
      playerRef.current = null
    }
    // Only initialize once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !videoId || !isReady) return
    player.cueVideoById(videoId)
    clearTimer()
  }, [videoId, clearTimer, isReady])

  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
    clearTimer()
  }, [clearTimer])

  const playSegment = useCallback(
    (duration: number) => {
      const player = playerRef.current
      if (!player) return
      clearTimer()
      player.seekTo(0, true)
      player.playVideo()
      timerRef.current = window.setTimeout(() => {
        player.pauseVideo()
      }, duration * 1000)
    },
    [clearTimer],
  )

  const seekToStart = useCallback(() => {
    playerRef.current?.seekTo(0, true)
  }, [])

  return {
    containerRef,
    play,
    pause,
    playSegment,
    seekToStart,
  }
}
