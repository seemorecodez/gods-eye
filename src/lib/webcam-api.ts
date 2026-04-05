import { CameraFeed } from './types'

  'Military Installation',
]
  'Military Installation',
  'Research Station Feed'
]

  { name: 'Taiwan Strait', la
  { name: 'Persian Gulf', lat: 27.0, lng: 51.5, type: 'satellite' as const
  { name: 'Kashmir Region', lat: 34.0, lng: 76.0, type: 'border' as const },

  try {
      headers: {
      }

      return []


      name: webcam.title,
      l
      status: webcam.status?.current === 'active' ? 'online' : 'offline',
      provider: 
        : 'Public Webcam',
      t


  }

  con

    const camerasPerLocation = 8 + Mat
    for (let i = 0; i < camerasPerLocation; i++) {
      const lngOffse
      const provider = CA
      const statusRandom = Math.random()
      if (statusRandom < 0.7) status = 'onl
      else status = 'error'
      const cameraNum = String(cameraId).padStart(4, '0')
      
        id: `${prefix}-${cameraNum}`,
        lat: location.lat + latOffset,
        streamUrl: `rtsp:/
        lastFrame: new Date(Da
        type: location.type === 'satellite' ? 'sa
      


}
export async 
   
 


















































