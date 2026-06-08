# Demarie – Ventas Perdidas

App para registrar ventas perdidas por tienda y generar reportes con IA.

## Setup

### 1. Clonar e instalar
```bash
npm install
```

### 2. Variables de entorno
Copia `.env.local.example` a `.env.local` y agrega tu API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Correr en local
```bash
npm run dev
```

### Deploy en Vercel

1. Sube este proyecto a un repo en GitHub
2. Ve a [vercel.com](https://vercel.com) → New Project → importa el repo
3. En **Environment Variables** agrega:
   - `ANTHROPIC_API_KEY` = tu API key de Anthropic
4. Deploy

> **Nota sobre datos**: Vercel usa `/tmp` para almacenamiento, que es efímero entre deploys. 
> Para persistencia real, conecta una base de datos como [Vercel KV](https://vercel.com/docs/storage/vercel-kv) 
> o [PlanetScale](https://planetscale.com) (ambas tienen plan gratuito).

## Funcionalidades

- **Por tienda**: Alto Las Condes, Parque Arauco, Casa Costanera
- **Registro**: producto, talla, nombre, email, teléfono, comentario libre
- **Insights automáticos**: Claude analiza cada registro al guardarlo
- **Dashboard**: filtros por tienda y fechas
- **Análisis IA**: reporte ejecutivo con productos top, tallas con quiebre, acciones recomendadas
- **Clientes**: lista agrupada por producto con opción de copiar emails
- **Export Excel**: descarga filtrada
