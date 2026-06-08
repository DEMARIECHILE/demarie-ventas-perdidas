export type Tienda = 'Alto Las Condes' | 'Parque Arauco' | 'Casa Costanera'

export interface VentaPerdida {
  id: string
  tienda: Tienda
  fecha: string        // ISO string
  nombre?: string
  email?: string
  telefono?: string
  producto?: string
  talla?: string
  comentario?: string
  // Fields extracted by AI from comentario
  insights?: string
  createdAt: string
}
