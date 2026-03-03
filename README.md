# 🏷️ Generador de Etiquetas - Bodegas Davita

Aplicación web profesional diseñada para la gestión logística y generación de etiquetas de empaques terciarios en Bodegas Davita. Permite optimizar el flujo de despacho mediante la identificación precisa de lotes, bultos y gestión FEFO.

## 🚀 Características Principales

- **Generación de Etiquetas (20cm x 20cm):** Formato estandarizado para alta visibilidad en almacén.
- **Carga Masiva vía Excel:** Importa maestros de productos y centros de destino directamente desde archivos `.xlsx`.
- **QR Dinámico:** Generación automática de códigos QR basados en el número de lote para trazabilidad.
- **Gestión FEFO:** Campo dedicado para fecha de vencimiento/salida prioritaria.
- **Personalización de Marca:** Permite cargar logos personalizados (PNG) para las etiquetas.
- **Exportación a PDF:** Optimizado para imprimir dos etiquetas por hoja en formato Oficio 2 (216mm x 330mm).
- **Interfaz Multi-Tema:** Tres variantes visuales (Teal, Petróleo y Eléctrico) para comodidad del usuario.

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite** (Build tool ultra rápido)
- **Tailwind CSS** (Diseño responsivo y moderno)
- **Lucide React** (Iconografía profesional)
- **jsPDF & html2canvas** (Motor de generación de documentos)
- **XLSX** (Procesamiento de datos Excel)

## 💻 Instalación Local

Si deseas ejecutar el proyecto en tu propia computadora:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Alejo137/generador_etiqueta_Davita.git
