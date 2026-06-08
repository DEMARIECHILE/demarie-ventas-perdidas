export type Tienda = 'Alto Las Condes' | 'Parque Arauco' | 'Casa Costanera'

export interface VentaPerdida {
  id: string
  tienda: Tienda
  fecha: string
  nombre?: string
  email?: string
  telefono?: string
  producto?: string
  modelo?: string
  color?: string
  talla?: string
  comentario?: string
  insights?: string
  createdAt: string
}
