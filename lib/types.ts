export interface Bus {
  id: string
  busId: string
  name: string
  routeId: string
  capacity?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface Stop {
  id: string
  name: string
  latitude: number
  longitude: number
  order: number
  description?: string
  audioUrl?: string
  createdAt: string
}

export interface Route {
  id: string
  name: string
  description?: string
  color?: string
  stops: Stop[]
  createdAt: string
  updatedAt: string
}

export interface BusLocation {
  id: string
  busId: string
  active: boolean
  latitude: number
  longitude: number
  lastPassedStopOrder: number
  updatedAt: string
}